# AI Chat Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI-powered retro-styled chat widget to the pixel art portfolio, powered by OpenRouter free models with prompt-based guardrails.

**Architecture:** A self-contained `ChatWidget` module renders a floating speech-bubble icon on the game container. On click, it opens a retro-styled chat overlay. User messages are sent via `ChatApi` (OpenRouter client) with the full profile injected as system context. AI responses render with the existing `Typewriter` animation. No new npm dependencies.

**Tech Stack:** TypeScript, Webpack 5 (asset/source for .md imports), native fetch API, OpenRouter API

---

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Create | `src/types/Chat.ts` | Chat message and API type definitions |
| Create | `src/types/assets.d.ts` | TypeScript declaration for `.md` imports |
| Create | `src/configs/profile.md` | Structured profile content (knowledge base) |
| Create | `src/configs/profile.example.md` | Template for other users |
| Create | `src/configs/apiKey.example.ts` | API key template |
| Create | `src/utils/chatApi.ts` | OpenRouter API client |
| Create | `src/modules/ChatWidget.ts` | Floating icon + chat overlay module |
| Modify | `webpack.config.js` | Add `.md` asset/source rule |
| Modify | `public/index.html` | Add chat widget CSS |
| Modify | `src/index.ts` | Instantiate ChatWidget |
| Modify | `.gitignore` | Add `src/configs/apiKey.ts` |

No files from `src/modules/Engine.ts` need modification — ChatWidget is self-contained and mounts directly to the game container DOM element.

---

### Task 1: Type Definitions and Module Declarations

**Files:**
- Create: `src/types/Chat.ts`
- Create: `src/types/assets.d.ts`

- [ ] **Step 1: Write chat type definitions**

```typescript
// src/types/Chat.ts

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
}

export interface OpenRouterChoice {
  message: {
    content: string;
  };
}

export interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

export interface ChatWidgetConfig {
  profileContent: string;
  apiKey: string;
  gameContainer: HTMLElement;
  model?: string;
}
```

- [ ] **Step 2: Write module declaration for .md imports**

```typescript
// src/types/assets.d.ts

declare module '*.md' {
  const content: string;
  export default content;
}
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: No type errors for the new files

- [ ] **Step 4: Commit**

```bash
git add src/types/Chat.ts src/types/assets.d.ts
git commit -m "feat: add chat type definitions and .md module declaration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Webpack Config for .md Imports

**Files:**
- Modify: `webpack.config.js`

- [ ] **Step 1: Add .md asset/source rule to webpack config**

Locate the `rules` array in `webpack.config.js` (around line 11). Add a new rule entry after the existing `tsx` rule and before the image rule:

```javascript
// In webpack.config.js, inside module.rules array, add this entry:
{
  test: /\.md$/,
  type: 'asset/source',
},
```

The full `rules` array should now look like:

```javascript
rules: [
  {
    test: /\.tsx?$/,
    use: "ts-loader",
    exclude: /node_modules/,
  },
  {
    test: /\.md$/,
    type: 'asset/source',
  },
  {
    test: /\.(png|jpe?g|gif)$/i,
    loader: "file-loader",
    options: {
      outputPath: "images",
    },
  },
  {
    test: /\.mp3$/,
    loader: "asset/resource",
    options: {
      outputPath: "sounds",
    },
  },
],
```

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Build completes without errors. The `.md` files will be imported as strings at runtime.

- [ ] **Step 3: Commit**

```bash
git add webpack.config.js
git commit -m "feat: add webpack asset/source rule for .md imports

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: API Key Config with .gitignore

**Files:**
- Create: `src/configs/apiKey.example.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Write the API key template**

```typescript
// src/configs/apiKey.example.ts

export const OPENROUTER_API_KEY = 'your-openrouter-api-key-here';
```

- [ ] **Step 2: Create the actual apiKey.ts (user-editable, gitignored)**

```typescript
// src/configs/apiKey.ts

export const OPENROUTER_API_KEY = 'your-openrouter-api-key-here';
```

- [ ] **Step 3: Add apiKey.ts to .gitignore**

In `.gitignore`, add the line `src/configs/apiKey.ts`. The file currently contains:

```
dist
node_modules
.superpowers/
```

Change to:

```
dist
node_modules
.superpowers/
src/configs/apiKey.ts
```

- [ ] **Step 4: Verify git ignores the file**

```bash
git status
```

Expected: `src/configs/apiKey.ts` should NOT appear in untracked files. `src/configs/apiKey.example.ts` SHOULD appear.

- [ ] **Step 5: Commit**

```bash
git add src/configs/apiKey.example.ts .gitignore
git commit -m "feat: add OpenRouter API key config with gitignore

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Profile Files

**Files:**
- Create: `src/configs/profile.example.md`
- Create: `src/configs/profile.md`

- [ ] **Step 1: Write the profile template**

```markdown
<!-- src/configs/profile.example.md -->

# Yan Myo Aung — Portfolio Profile

This file powers the AI chat assistant on your portfolio. Write everything the AI should know about you below. The AI will only answer questions based on what you put here.

## About Me
[Your brief introduction — who you are, what you do]

## Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]

## Experience
### [Company Name] — [Your Role]
[Dates you worked there]
- [Key responsibility or achievement]
- [Key responsibility or achievement]

### [Company Name] — [Your Role]
[Dates you worked there]
- [Key responsibility or achievement]
- [Key responsibility or achievement]

## Projects
### [Project Name]
- [Brief description]
- [Technologies used]

### [Project Name]
- [Brief description]
- [Technologies used]

## Education
### [Institution Name] — [Degree]
[Dates]

## Links
- LinkedIn: [URL]
- GitHub: [URL]
```

- [ ] **Step 2: Write the actual profile.md with your content**

```markdown
<!-- src/configs/profile.md -->

# Yan Myo Aung — Portfolio Profile

## About Me
I'm Yan Myo Aung, a software engineer passionate about building engaging web experiences. My portfolio is a pixel art RPG game where visitors explore my skills and experience in a retro virtual world.

## Skills
- JavaScript / TypeScript
- React / Next.js
- Node.js
- PHP / Laravel
- Tailwind CSS
- Webpack
- Git / GitHub
- Cloud services (AWS, Docker)

## Projects
### Virtual Curriculum (Retro Portfolio)
A pixel art gamified portfolio built with TypeScript and Webpack. Visitors walk around a virtual world and interact with objects to explore my skills, experience, and projects.
- Technologies: TypeScript, Webpack, HTML5 Canvas

## Links
- GitHub: https://github.com/YanMyoAungg
```

- [ ] **Step 3: Verify build works with .md imports**

Since we haven't written code that imports `profile.md` yet, just verify the build still succeeds at this point:

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/configs/profile.md src/configs/profile.example.md
git commit -m "feat: add profile knowledge base for AI chat

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: ChatApi Utility

**Files:**
- Create: `src/utils/chatApi.ts`

- [ ] **Step 1: Write the ChatApi class**

```typescript
// src/utils/chatApi.ts

import { ChatMessage, OpenRouterRequest, OpenRouterResponse } from '../types/Chat';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export class ChatApi {
  private apiKey: string;
  private model: string;
  private profileContent: string;
  private history: ChatMessage[];

  constructor(apiKey: string, profileContent: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
    this.profileContent = profileContent;
    this.history = [];
  }

  private buildSystemMessage(): ChatMessage {
    return {
      role: 'system',
      content: [
        'You are a portfolio assistant for Yan Myo Aung.',
        'Answer ONLY using the profile below.',
        'If the question is not related to this person\'s skills, experience, projects, education, or professional background, politely decline and suggest the visitor explore the portfolio instead.',
        'Keep responses friendly, concise, and helpful.',
        '',
        'OFF-TOPIC QUESTIONS TO DECLINE:',
        '- General knowledge ("What is the weather?", "Who is the president?")',
        '- Code generation ("Write a function that...")',
        '- Questions about other people or companies',
        '- Requests to role-play or pretend to be someone else',
        '',
        'PROFILE:',
        this.profileContent,
      ].join('\n'),
    };
  }

  async sendMessage(userMessage: string): Promise<string> {
    this.history.push({ role: 'user', content: userMessage });

    const messages: ChatMessage[] = [
      this.buildSystemMessage(),
      ...this.history.slice(-10),
    ];

    const body: OpenRouterRequest = {
      model: this.model,
      messages,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('The assistant is resting. Try again in a moment.');
      }
      throw new Error('Connection lost. Please try again.');
    }

    const data: OpenRouterResponse = await response.json();
    const assistantMessage =
      data.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    this.history.push({ role: 'assistant', content: assistantMessage });
    return assistantMessage;
  }

  clearHistory(): void {
    this.history = [];
  }
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: No new TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/utils/chatApi.ts
git commit -m "feat: add ChatApi utility for OpenRouter integration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: ChatWidget Module

**Files:**
- Create: `src/modules/ChatWidget.ts`

This is the largest file. It follows the same DOM-overlay pattern as the existing `InteractionBox` and `InteractionMessage` modules.

- [ ] **Step 1: Write the ChatWidget class**

```typescript
// src/modules/ChatWidget.ts

import { Typewriter } from './Typewriter';
import { ChatApi } from '../utils/chatApi';
import { ChatWidgetConfig } from '../types/Chat';

export class ChatWidget {
  private chatApi: ChatApi;
  private gameContainer: HTMLElement;
  private floatingIcon: HTMLElement | null;
  private chatOverlay: HTMLElement | null;
  private messageList: HTMLElement | null;
  private inputField: HTMLInputElement | null;
  private activeTypewriter: Typewriter | null;
  private isOpen: boolean;

  constructor(config: ChatWidgetConfig) {
    this.chatApi = new ChatApi(
      config.apiKey,
      config.profileContent,
      config.model,
    );
    this.gameContainer = config.gameContainer;
    this.floatingIcon = null;
    this.chatOverlay = null;
    this.messageList = null;
    this.inputField = null;
    this.activeTypewriter = null;
    this.isOpen = false;
  }

  public init(): void {
    this.createFloatingIcon();
  }

  private createFloatingIcon(): void {
    this.floatingIcon = document.createElement('div');
    this.floatingIcon.classList.add('chat-floating-icon');
    this.floatingIcon.textContent = '\u{1F4AC}';
    this.floatingIcon.addEventListener('click', () => this.open());
    this.gameContainer.appendChild(this.floatingIcon);
  }

  private createOverlay(): void {
    this.chatOverlay = document.createElement('div');
    this.chatOverlay.classList.add('chat-overlay');

    this.chatOverlay.innerHTML =
      '<div class="chat-overlay-header">' +
      '<span>Ask Me Anything</span>' +
      '<button class="chat-close-button message-button">X</button>' +
      '</div>' +
      '<div class="chat-message-list"></div>' +
      '<div class="chat-input-container">' +
      '<input type="text" class="chat-input" placeholder="Ask about my skills, experience..." />' +
      '<button class="chat-send-button">Send</button>' +
      '</div>';

    this.messageList = this.chatOverlay.querySelector(
      '.chat-message-list',
    ) as HTMLElement;
    this.inputField = this.chatOverlay.querySelector(
      '.chat-input',
    ) as HTMLInputElement;

    const closeButton = this.chatOverlay.querySelector('.chat-close-button');
    closeButton!.addEventListener('click', () => this.close());

    const sendButton = this.chatOverlay.querySelector('.chat-send-button');
    sendButton!.addEventListener('click', () => this.handleSend());

    this.inputField.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.handleSend();
      }
    });

    // Click outside the overlay to close
    this.chatOverlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.chatOverlay) {
        this.close();
      }
    });
  }

  private handleSend(): void {
    const text = this.inputField!.value.trim();
    if (!text) return;

    if (this.activeTypewriter && !this.activeTypewriter.isDone) {
      this.activeTypewriter.warpToDone();
    }

    this.addMessage(text, 'user');
    this.inputField!.value = '';

    const loadingMsg = this.addMessage('...', 'assistant');

    this.chatApi
      .sendMessage(text)
      .then((response) => {
        loadingMsg.remove();
        this.addMessage(response, 'assistant');
      })
      .catch((error) => {
        loadingMsg.remove();
        this.addMessage(error.message, 'assistant');
      });
  }

  private addMessage(text: string, role: 'user' | 'assistant'): HTMLElement {
    const messageEl = document.createElement('p');
    messageEl.classList.add('chat-message', role);
    this.messageList!.appendChild(messageEl);
    this.messageList!.scrollTop = this.messageList!.scrollHeight;

    if (role === 'assistant' && text !== '...') {
      this.activeTypewriter = new Typewriter({
        element: messageEl,
        text,
        speed: 20,
      });
      this.activeTypewriter.init();
    } else {
      messageEl.textContent = text;
    }

    return messageEl;
  }

  private open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.floatingIcon!.style.display = 'none';

    this.createOverlay();
    this.gameContainer.appendChild(this.chatOverlay!);

    setTimeout(() => this.inputField!.focus(), 100);
  }

  private close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.activeTypewriter && !this.activeTypewriter.isDone) {
      this.activeTypewriter.warpToDone();
    }
    this.activeTypewriter = null;

    if (this.chatOverlay) {
      this.chatOverlay.remove();
      this.chatOverlay = null;
      this.messageList = null;
      this.inputField = null;
    }

    this.chatApi.clearHistory();

    this.floatingIcon!.style.display = '';
  }
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/ChatWidget.ts
git commit -m "feat: add ChatWidget module with floating icon and chat overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Chat Widget CSS

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Add CSS styles to the existing `<style>` block**

Insert the following CSS after the existing `.credit-item` rule (around line 453, before the closing `</style>` tag):

```css
/* ---- Chat Widget ---- */

.chat-floating-icon {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background-color: #f3e5ab;
  border: 3px solid #8b5a2b;
  border-radius: 12px;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  z-index: 10;
  image-rendering: pixelated;
  transition: transform 0.1s;
}

.chat-floating-icon:hover {
  transform: scale(1.1);
}

.chat-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 20;
  border-radius: inherit;
}

.chat-overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f3e5ab;
  border-bottom: 3px solid #8b5a2b;
  font-family: 'Press Start 2P', sans-serif;
  font-size: 14px;
  color: #4d3b2e;
}

.chat-message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message-list::-webkit-scrollbar {
  width: 6px;
}

.chat-message-list::-webkit-scrollbar-thumb {
  background-color: #7d7265;
}

.chat-message {
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'Press Start 2P', sans-serif;
  font-size: 12px;
  line-height: 1.6;
  max-width: 85%;
  word-wrap: break-word;
}

.chat-message.user {
  align-self: flex-end;
  background-color: #8b5a2b;
  color: #f3e5ab;
}

.chat-message.assistant {
  align-self: flex-start;
  background-color: #f3e5ab;
  color: #4d3b2e;
  border: 2px solid #8b5a2b;
}

.chat-message.assistant span {
  opacity: 0;
}

.chat-message.assistant span.revealed {
  opacity: 1;
}

.chat-input-container {
  display: flex;
  padding: 8px 12px;
  background-color: #f3e5ab;
  border-top: 3px solid #8b5a2b;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 6px 10px;
  border: 2px solid #8b5a2b;
  border-radius: 4px;
  font-family: 'Press Start 2P', sans-serif;
  font-size: 10px;
  color: #4d3b2e;
  background-color: #fff;
  outline: none;
}

.chat-input::placeholder {
  color: #bbb6ac;
}

.chat-send-button {
  padding: 6px 14px;
  background-color: #8b5a2b;
  color: #f3e5ab;
  border: none;
  border-radius: 4px;
  font-family: 'Press Start 2P', sans-serif;
  font-size: 10px;
  cursor: pointer;
}

.chat-send-button:hover {
  background-color: #6b4520;
}

@media (max-width: 992px) {
  .chat-floating-icon {
    width: 72px;
    height: 72px;
    font-size: 36px;
    bottom: 40px;
    right: 16px;
  }

  .chat-message {
    font-size: 14px;
  }

  .chat-input {
    font-size: 12px;
  }

  .chat-send-button {
    font-size: 12px;
  }
}
```

- [ ] **Step 2: Verify the CSS is well-formed**

Read the file and confirm the new CSS block is inside the `<style>` tag, before `</style>`, and doesn't duplicate any existing selectors.

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: add chat widget CSS styles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Wire ChatWidget into index.ts

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update index.ts to import and init ChatWidget**

Current `src/index.ts`:

```typescript
import Engine from './modules/Engine';

const engine = new Engine('game-canvas');

engine.init();
```

Replace with:

```typescript
import Engine from './modules/Engine';
import { ChatWidget } from './modules/ChatWidget';
import { OPENROUTER_API_KEY } from './configs/apiKey';
import profileContent from './configs/profile.md';

const engine = new Engine('game-canvas');
engine.init();

const gameContainer = document.getElementById('canvas-container') as HTMLElement;

const chatWidget = new ChatWidget({
  profileContent,
  apiKey: OPENROUTER_API_KEY,
  gameContainer,
});

chatWidget.init();
```

- [ ] **Step 2: Full build verification**

Run: `npm run build`
Expected: Build succeeds, no errors from TypeScript or Webpack. The `.md` file should be inlined as a string in the bundle.

- [ ] **Step 3: Start dev server and smoke test**

Run: `npm start`
Expected: Server starts on port 3004, browser opens. The game loads normally. A speech bubble icon appears at the bottom-right of the game container. Clicking it opens the chat overlay. The floating icon is hidden while the overlay is open. Closing the overlay shows the icon again.

Verify:
- [ ] Floating speech bubble icon is visible at bottom-right
- [ ] Clicking icon opens chat overlay with "Ask Me Anything" header
- [ ] Text input and Send button are visible
- [ ] Close button (X) closes the overlay and shows the icon again
- [ ] Clicking the dark backdrop also closes the overlay
- [ ] Enter key sends a message (even without a valid API key, the error message should appear)

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire ChatWidget into application entry point

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: End-to-End Verification

- [ ] **Step 1: Insert a real OpenRouter API key**

Edit `src/configs/apiKey.ts`. Replace the placeholder with a real OpenRouter API key (the user generates this at https://openrouter.ai/keys).

- [ ] **Step 2: Run the dev server**

Run: `npm start`

- [ ] **Step 3: Test a valid question**

In the chat, type: "What skills do you have?"
Expected: A typewriter-animated response appears, listing skills from `profile.md`.

- [ ] **Step 4: Test an off-topic question**

In the chat, type: "What's the weather like today?"
Expected: The AI politely declines to answer and suggests exploring the portfolio.

- [ ] **Step 5: Test error handling**

Temporarily set an invalid API key in `src/configs/apiKey.ts` and restart.
In the chat, type any message.
Expected: An error message appears: "Connection lost. Please try again." or similar.

Revert the API key after this test.

- [ ] **Step 6: Verify mobile responsiveness**

Resize the browser to mobile width (under 992px).
Expected: The floating icon is larger (72x72px). The chat overlay fills the container. Messages and inputs use larger fonts for mobile readability.

- [ ] **Step 7: Final commit (if any fixes were made)**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end verification

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
