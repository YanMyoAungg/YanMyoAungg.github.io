# AI Chat Widget — Design Spec

**Date:** 2026-07-03
**Status:** Approved

## Overview

Add an AI-powered chat widget to the pixel art gamified portfolio. Visitors click a floating icon to open a retro-styled chat overlay and ask questions about the portfolio owner. Responses are grounded in a structured profile file via full context injection to an OpenRouter free model.

## Architecture & Components

```
src/
├── configs/
│   └── profile.md              ← structured profile (manually authored)
├── modules/
│   ├── ChatWidget.ts            ← floating icon + chat overlay UI
│   └── Typewriter.ts            ← existing: reused for response rendering
├── utils/
│   └── chatApi.ts               ← OpenRouter API client
├── types/
│   └── Chat.ts                  ← chat-specific type definitions
```

### profile.md

A markdown file containing everything the AI should know: skills, experience, projects, education, and any other facts displayed in the game world. Injected verbatim into the system prompt.

### chatApi.ts

A lightweight utility with no external dependencies:

- Constructs the request payload (system prompt + user message + conversation history)
- Calls `POST https://openrouter.ai/api/v1/chat/completions` with the OpenRouter API key
- The free model is configurable via a constant
- Returns the assistant's response text
- Handles errors (network failure, rate limits, API errors) and surfaces them to the caller

### ChatWidget.ts

A new module following existing game module patterns (`InteractionBox`, `InteractionMessage`):

- **Floating icon** — A pixel-art speech bubble rendered at a fixed position (bottom-right) as a DOM overlay element, matching the game's color palette
- **Chat overlay** — On click, opens a retro-styled dialog box overlay modeled after existing `InteractionBox` styling: bordered box with pixel-art corners, dark background, monospace/pixel font
- **Message display** — Visitor messages right-aligned, AI responses left-aligned with a small avatar. AI responses render with the `Typewriter` character-by-character effect
- **Text input** — Bordered input field at the bottom of the overlay, styled consistently
- **Close** — "X" button in the corner; clicking outside the overlay also closes it

### Engine Integration

`ChatWidget` is instantiated in `Engine.ts` alongside existing modules (`InteractionBox`, `DirectionInput`). It renders as a DOM overlay above the game canvas — the same pattern already used for `InteractionBox` and `InteractionMessage`.

## Data Flow

```
Visitor types message
        │
        ▼
ChatWidget captures input, appends to in-memory history
        │
        ▼
chatApi.ts builds request:
  ┌─────────────────────────────────────────────┐
  │ System prompt:                              │
  │   "You are a portfolio assistant for [Name].│
  │    Answer ONLY using the profile below. If  │
  │    the question is not about this person,   │
  │    politely decline and redirect to the     │
  │    portfolio.                               │
  │                                             │
  │    PROFILE:                                 │
  │    <full contents of profile.md>             │
  │                                             │
  │    CONVERSATION HISTORY:                     │
  │    <last N messages>                         │
  └─────────────────────────────────────────────┘
        │
        ▼
POST to OpenRouter /chat/completions
        │
        ▼
Response returned to ChatWidget
        │
        ▼
Typewriter renders response character-by-character
```

## Guardrails

The system stays on-topic through prompt-based guardrails only — no server-side validation or middleware:

1. **System prompt constraint** — The model is explicitly told it may ONLY answer using the provided profile and must politely decline off-topic questions
2. **Off-topic examples** — The prompt includes concrete examples of questions to decline: general knowledge queries, code generation requests, questions about other people, weather, etc.
3. **Configurable model** — The OpenRouter model ID is a constant, easy to swap if a different free model follows instructions better
4. **Full context injection** — The complete profile is always in context, so the model never needs to guess or hallucinate facts

## Error States

| State | Behavior |
|---|---|
| API down / rate limited | Retro-styled message: "The assistant is resting. Try again in a moment." |
| Network error | "Connection lost." with a retry option |
| Empty or missing profile.md | Chat shows "Not configured yet" on open; no requests sent |
| Model declines (off-topic) | Model's polite refusal displayed normally |

## Styling

- Floating icon: small pixel-art speech bubble, bottom-right of viewport
- Chat overlay: matches existing `InteractionBox` style — retro bordered box with pixel-art corners, dark background, monospace/pixel font, same color palette as game UI
- Message bubbles: visitor messages right-aligned, AI responses left-aligned with small avatar icon
- Input field: bordered text input matching overlay style
- All dimensions use existing game constants (`CANVAS_SCALE`, `MAX_WIDTH_MOBILE`, etc.) for responsiveness

## Technical Details

- **No new npm dependencies** — uses native `fetch` API
- **API key** — stored in `src/configs/apiKey.ts` which exports a constant string. The file is added to `.gitignore` with a `.example` template committed instead. The user copies the template and inserts their OpenRouter key before building.
- **Conversation history** — in-memory array of message objects, resets on page reload (sufficient for short portfolio Q&A sessions)
- **TypeScript types** — new `Chat.ts` type file for message objects, API request/response shapes
- **No persistence** — no localStorage, no backend, fully stateless

## Testing

- Manual testing through the existing game debug mode; a chat debug toggle can be added
- Console warning if `profile.md` is empty or missing when chat is opened
- If test infrastructure is added later, `chatApi.ts` is the primary unit-test target (request construction, error handling)

## Out of Scope

- Conversation persistence across page reloads
- Multi-turn memory beyond in-session history
- Streaming (simpler initial implementation; can be added later)
- Analytics or usage tracking
- Multiple conversation threads
- Markdown rendering in responses (plain text is sufficient for profile Q&A)
