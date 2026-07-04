# RAG System Improvement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the thin manual profile.md with a hybrid system: build-time extraction from game maps + manual profile.custom.md overrides, first-person AI roleplay, and a resume download button.

**Architecture:** A build script (`scripts/extract-profile.ts`) runs before webpack, reads all map configs, extracts facts (skills, experience, education, links, projects, personal text), filters out game flavor, and writes `profile.json`. ChatApi assembles the system prompt from both the auto-extracted JSON and the manual `profile.custom.md`.

**Tech Stack:** TypeScript, ts-node (new dev dependency), Webpack asset/source loader (existing), native file system APIs

---

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Install | `ts-node` (devDependency) | Run extraction script at build time |
| Create | `scripts/extract-profile.ts` | Reads map configs, writes profile.json |
| Create | `src/configs/profile.custom.md` | Manual overrides: tone, roleplay rules, off-topic, resume |
| Delete | `src/configs/profile.md`, `src/configs/profile.example.md` | Replaced by new files |
| Modify | `.gitignore` | Add profile.json (build artifact) |
| Modify | `package.json` | build and start scripts run extraction first |
| Modify | `src/utils/chatApi.ts` | Constructor accepts two profile sources, system prompt assembled from both |
| Modify | `src/modules/ChatWidget.ts` | Add resume download button to chat header |
| Modify | `src/index.ts` | Import new profile files instead of old profile.md |
| Modify | `src/configs/maps/outside.ts:216-232` | Fix degree text (completed → L5DC in-progress) |
| Create | `public/resume.pdf` | Placeholder; user replaces with their CV |

---

### Task 1: Install ts-node and Update Package Scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install ts-node as dev dependency**

Run: `npm install --save-dev ts-node`
Expected: `ts-node` added to `devDependencies` in `package.json`

- [ ] **Step 2: Update build and start scripts**

Current `package.json` scripts:
```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "webpack --config webpack.config.js --mode production",
  "start": "webpack-dev-server --mode development"
}
```

Change to:
```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "npx ts-node scripts/extract-profile.ts && webpack --config webpack.config.js --mode production",
  "start": "npx ts-node scripts/extract-profile.ts && webpack-dev-server --mode development"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add ts-node and update scripts for profile extraction step

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Delete Old Profile Files and Create profile.custom.md

**Files:**
- Delete: `src/configs/profile.md`
- Delete: `src/configs/profile.example.md`
- Create: `src/configs/profile.custom.md`

- [ ] **Step 1: Delete old profile files**

```bash
rm src/configs/profile.md src/configs/profile.example.md
```

- [ ] **Step 2: Write profile.custom.md**

```markdown
# Role & Tone

You ARE Yan Myo Aung. Speak in first person ("I", "me", "my") as if
you're talking directly to the visitor. Be friendly, warm, and genuine.
Keep responses brief — 2 to 4 sentences unless they ask for detail. Match
the playful, retro vibe of the portfolio game.

# Personal

- I built this pixel art portfolio because I love retro games and wanted
  my portfolio to reflect my personality, not just be a generic form.
- I'm currently studying NCC Education (L5DC, second year) and I hold
  an L4DC Diploma. I'm passionate about learning and growing as a
  developer.

# Resume

If someone asks about my experience, job history, background, or a CV,
I offer: "I'd be happy to share my resume — you can download it here:
/resume.pdf"

# Off-Topic

If someone asks something completely unrelated to me, my skills, or my
work, I politely redirect: "Hey, I'd rather talk about my work and
projects! Anything you'd like to know about my experience or skills?"
```

- [ ] **Step 3: Commit**

```bash
git add src/configs/profile.custom.md
git rm src/configs/profile.md src/configs/profile.example.md
git commit -m "feat: replace manual profile.md with profile.custom.md for overrides

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Create Extraction Script

**Files:**
- Create: `scripts/extract-profile.ts`

The script reads map config source files as text, extracts factual content using regex patterns, filters out game flavor, and writes `src/configs/profile.json`.

- [ ] **Step 1: Write the extraction script**

```typescript
// scripts/extract-profile.ts

import * as fs from 'fs';
import * as path from 'path';

interface ProfileEntry {
  text: string;
  category: string;
}

interface ProfileData {
  identity: { text: string }[];
  skills: { name: string; category?: string }[];
  experience: { company: string; description: string; role?: string; dates?: string }[];
  education: { program: string; status: string; details: string[] }[];
  projects: { name: string; description: string }[];
  personal: { text: string }[];
  links: { url: string }[];
}

const MAPS_DIR = path.join(__dirname, '..', 'src', 'configs', 'maps');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'configs', 'profile.json');

const COMPANY_NAMES = ['PassionGeek', 'G-Next', 'Host Myanmar'];

function readFileAsText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function extractSkills(content: string): { name: string }[] {
  const skills: { name: string }[] = [];
  // Match: label: "SkillName"
  const labelRegex = /label:\s*(["'`])(.+?)\1/g;
  let match;
  while ((match = labelRegex.exec(content)) !== null) {
    const name = match[2];
    // Skip duplicates
    if (!skills.find(s => s.name === name)) {
      skills.push({ name });
    }
  }
  return skills;
}

function extractInteractions(content: string): { title?: string; texts: string[] }[] {
  const results: { title?: string; texts: string[] }[] = [];
  // Find all interactionBox blocks with title + textLines
  const interactionBoxRegex = /type:\s*["'`]interactionBox["'`]\s*[\s\S]*?title:\s*(["'`])(.+?)\1[\s\S]*?textLines:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = interactionBoxRegex.exec(content)) !== null) {
    const title = match[2];
    const textLinesBlock = match[3];
    const texts: string[] = [];
    // Extract each backtick-quoted string from the textLines array
    const textRegex = /`(.+?)`/g;
    let textMatch;
    while ((textMatch = textRegex.exec(textLinesBlock)) !== null) {
      texts.push(textMatch[1]);
    }
    results.push({ title, texts });
  }
  return results;
}

function extractMessages(content: string): string[] {
  const messages: string[] = [];
  // Match message-type interactions with text
  const msgRegex = /type:\s*["'`]message["'`]\s*,\s*\n\s*text:\s*(`.+?`|["'](.+?)["'])/g;
  let match;
  while ((match = msgRegex.exec(content)) !== null) {
    const raw = match[1];
    // Strip surrounding backticks or quotes
    const text = raw.replace(/^`|`$/g, '').replace(/^["']|["']$/g, '');
    messages.push(text);
  }
  return messages;
}

function extractLinks(content: string): string[] {
  const links: string[] = [];
  // Match URLs in backtick-quoted text (links in interactions)
  const urlRegex = /(https?:\/\/[^\s`'"]+)/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    if (!links.includes(match[0])) {
      links.push(match[0]);
    }
  }
  return links;
}

function buildProfile(): ProfileData {
  const profile: ProfileData = {
    identity: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    personal: [],
    links: [],
  };

  const mapFiles = fs.readdirSync(MAPS_DIR).filter(f => f.endsWith('.ts'));

  for (const file of mapFiles) {
    const filePath = path.join(MAPS_DIR, file);
    const content = readFileAsText(filePath);

    // Extract skills from techskills map
    if (file.includes('techskills')) {
      profile.skills = extractSkills(content);
    }

    // Extract from outside.ts (experience, education, projects, links, personal)
    if (file === 'outside.ts') {
      // Companies
      const interactions = extractInteractions(content);
      for (const interaction of interactions) {
        const title = interaction.title || '';

        // Check if title matches a known company
        const company = COMPANY_NAMES.find(c => title.includes(c));
        if (company) {
          const allText = interaction.texts.join(' ');
          const existing = profile.experience.find(e => e.company === company);
          if (existing) {
            // Append additional text lines
            existing.description += ' ' + allText;
          } else {
            const datesMatch = title.match(/\((.+?)\)/);
            const dates = datesMatch ? datesMatch[1] : '';
            // Extract role from first text line if it contains "As a"
            const roleMatch = allText.match(/As a (.+?) at /);
            const role = roleMatch ? roleMatch[1] : undefined;
            profile.experience.push({
              company,
              description: allText,
              role,
              dates,
            });
          }
        }

        // Check if title matches education
        if (title.includes('Degree') || title.includes('Computer Science')) {
          profile.education.push({
            program: 'NCC Education (L5DC)',
            status: 'In progress — second year',
            details: interaction.texts,
          });
        }

        // Check if title matches projects
        if (title.includes('Projects')) {
          for (const text of interaction.texts) {
            // Each text line is a project: "ProjectName: description"
            const colonIdx = text.indexOf(':');
            if (colonIdx > 0) {
              profile.projects.push({
                name: text.substring(0, colonIdx).trim(),
                description: text.substring(colonIdx + 1).trim(),
              });
            } else {
              profile.projects.push({
                name: text.substring(0, 40),
                description: text,
              });
            }
          }
        }
      }

      // Links
      const links = extractLinks(content);
      for (const url of links) {
        profile.links.push({ url });
      }

      // Personal statements from message interactions
      const messages = extractMessages(content);
      const personalPattern = /^I (enjoy|built|love|wanted|am|can|occasionally)/i;
      for (const msg of messages) {
        if (personalPattern.test(msg)) {
          profile.personal.push({ text: msg });
        }
      }
    }
  }

  return profile;
}

function main(): void {
  console.log('Extracting profile data from map configs...');
  const profile = buildProfile();

  // Validate we got something useful
  if (profile.skills.length === 0) {
    console.error('ERROR: No skills extracted. Check the extraction script.');
    process.exit(1);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  console.log(`Profile written to ${OUTPUT_FILE}`);
  console.log(`  Skills: ${profile.skills.length}`);
  console.log(`  Experience: ${profile.experience.length} companies`);
  console.log(`  Education: ${profile.education.length} entries`);
  console.log(`  Projects: ${profile.projects.length}`);
  console.log(`  Links: ${profile.links.length}`);
  console.log(`  Personal: ${profile.personal.length} statements`);
}

main();
```

- [ ] **Step 2: Test the extraction script**

Run: `npx ts-node scripts/extract-profile.ts`
Expected: Script runs, prints summary to console, creates `src/configs/profile.json` with skills, experience, education, projects, links, and personal sections.

- [ ] **Step 3: Inspect the generated profile.json**

Run: `cat src/configs/profile.json`
Expected: JSON output with 13 skills from techskills map, 3 companies from outside map, education entry, 3 projects, 2 links (GitHub + LinkedIn), and at least 1 personal statement.

- [ ] **Step 4: Commit**

```bash
git add scripts/extract-profile.ts
git commit -m "feat: add build-time profile extraction script

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Add profile.json to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add profile.json to .gitignore**

The file currently contains:
```
dist
node_modules
.superpowers/
src/configs/apiKey.ts
```

Add `src/configs/profile.json`:

```
dist
node_modules
.superpowers/
src/configs/apiKey.ts
src/configs/profile.json
```

- [ ] **Step 2: Verify git ignores the file**

```bash
git status
```
Expected: `src/configs/profile.json` does NOT appear in untracked files.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add profile.json to gitignore (build artifact)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Add a types declaration for .json imports

**Files:**
- Modify: `src/types/assets.d.ts`

- [ ] **Step 1: Add .json module declaration**

Current `src/types/assets.d.ts`:
```typescript
declare module '*.md' {
  const content: string;
  export default content;
}
```

Add a `*.json` declaration:
```typescript
declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/assets.d.ts
git commit -m "feat: add .json module declaration for TypeScript

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Rewrite ChatApi to Use Both Profile Sources

**Files:**
- Modify: `src/utils/chatApi.ts`

- [ ] **Step 1: Rewrite chatApi.ts**

Replace the entire file with:

```typescript
// src/utils/chatApi.ts

import { ChatMessage, OpenRouterRequest, OpenRouterResponse } from '../types/Chat';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';
const MAX_HISTORY = 10;
const REQUEST_TIMEOUT_MS = 15_000;

export interface ProfileData {
  identity?: { text: string }[];
  skills?: { name: string }[];
  experience?: { company: string; description: string; role?: string; dates?: string }[];
  education?: { program: string; status: string; details?: string[] }[];
  projects?: { name: string; description: string }[];
  personal?: { text: string }[];
  links?: { url: string }[];
}

// NOTE: The API key is embedded in client-side JS since this is a static
// portfolio with no backend. Use a restricted-scope key from OpenRouter
// and be aware it is visible in browser network requests and source view.
export class ChatApi {
  private apiKey: string;
  private model: string;
  private history: ChatMessage[];
  private systemMessage: ChatMessage;

  constructor(apiKey: string, profileCustom: string, profileData: ProfileData | null, model?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
    this.history = [];
    this.systemMessage = this.buildSystemMessage(profileCustom, profileData);
  }

  private formatProfileFacts(data: ProfileData): string {
    const lines: string[] = [];

    if (data.skills && data.skills.length > 0) {
      lines.push('SKILLS:');
      lines.push(data.skills.map(s => `  - ${s.name}`).join('\n'));
    }

    if (data.experience && data.experience.length > 0) {
      lines.push('\nEXPERIENCE:');
      for (const exp of data.experience) {
        const roleLine = exp.role ? ` — ${exp.role}` : '';
        const datesLine = exp.dates ? ` (${exp.dates})` : '';
        lines.push(`  ${exp.company}${roleLine}${datesLine}`);
        lines.push(`    ${exp.description}`);
      }
    }

    if (data.education && data.education.length > 0) {
      lines.push('\nEDUCATION:');
      for (const edu of data.education) {
        lines.push(`  ${edu.program}`);
        lines.push(`    Status: ${edu.status}`);
        if (edu.details) {
          for (const detail of edu.details) {
            lines.push(`    ${detail}`);
          }
        }
      }
    }

    if (data.projects && data.projects.length > 0) {
      lines.push('\nPROJECTS:');
      for (const proj of data.projects) {
        lines.push(`  ${proj.name}: ${proj.description}`);
      }
    }

    if (data.personal && data.personal.length > 0) {
      lines.push('\nPERSONAL FACTS:');
      for (const p of data.personal) {
        lines.push(`  - ${p.text}`);
      }
    }

    if (data.links && data.links.length > 0) {
      lines.push('\nLINKS:');
      for (const link of data.links) {
        lines.push(`  ${link.url}`);
      }
    }

    return lines.join('\n');
  }

  private buildSystemMessage(profileCustom: string, profileData: ProfileData | null): ChatMessage {
    const facts = profileData ? this.formatProfileFacts(profileData) : '';

    const content = [
      profileCustom,
      '',
      '---',
      'FACTS ABOUT ME:',
      facts,
    ].join('\n');

    return {
      role: 'system',
      content,
    };
  }

  async sendMessage(userMessage: string): Promise<string> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      throw new Error('Please type a message to send.');
    }

    const requestMessages: ChatMessage[] = [
      this.systemMessage,
      ...this.history.slice(-MAX_HISTORY),
      { role: 'user', content: trimmed },
    ];

    const body: OpenRouterRequest = {
      model: this.model,
      messages: requestMessages,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error('Connection lost. Please try again.');
    }
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter
          ? `Try again in ${retryAfter} seconds.`
          : 'Try again in a moment.';
        throw new Error(`The assistant is resting. ${waitTime}`);
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Check your OpenRouter key in src/configs/apiKey.ts.');
      }
      if (response.status === 404) {
        throw new Error('AI model not found. The free model may have changed. Try updating DEFAULT_MODEL in src/utils/chatApi.ts.');
      }
      throw new Error('Connection lost. Please try again.');
    }

    const data: OpenRouterResponse = await response.json();
    const rawMessage =
      data.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    // Some free models leak internal safety tags. Strip common prefixes.
    const assistantMessage = rawMessage
      .replace(/^User\s+safety:\s*safe\.?\s*/i, '')
      .replace(/^\s*<thinking>[\s\S]*?<\/thinking>\s*/i, '')
      .trim() || 'Sorry, I could not generate a response.';

    this.history.push({ role: 'user', content: trimmed });
    this.history.push({ role: 'assistant', content: assistantMessage });
    return assistantMessage;
  }

  clearHistory(): void {
    this.history = [];
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors from `src/` directory.

- [ ] **Step 3: Commit**

```bash
git add src/utils/chatApi.ts
git commit -m "feat: rewrite ChatApi to use profile.custom.md + profile.json

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Update ChatWidget to Accept New Config

**Files:**
- Modify: `src/types/Chat.ts`
- Modify: `src/modules/ChatWidget.ts`

- [ ] **Step 1: Update ChatWidgetConfig type**

In `src/types/Chat.ts`, change `ChatWidgetConfig`:
```typescript
export interface ChatWidgetConfig {
  profileCustomContent: string;
  profileData: Record<string, unknown>;
  apiKey: string;
  gameContainer: HTMLElement;
  model?: string;
}
```

The old `profileContent: string` becomes `profileCustomContent: string` + `profileData: Record<string, unknown>`.

- [ ] **Step 2: Update ChatWidget constructor to pass both profile sources**

In `src/modules/ChatWidget.ts`, find the constructor (around line 18):
```typescript
this.chatApi = new ChatApi(
  config.apiKey,
  config.profileContent,
  config.model,
);
```

Replace with:
```typescript
this.chatApi = new ChatApi(
  config.apiKey,
  config.profileCustomContent,
  config.profileData as ProfileData | null,
  config.model,
);
```

Also add the import at the top of the file:
```typescript
import { ProfileData } from '../utils/chatApi';
```

- [ ] **Step 3: Add resume download button to chat header**

In the `createOverlay()` method, find the header innerHTML (around line 54):
```typescript
<div class="chat-overlay-header">
  <span>Ask Me Anything</span>
  <button class="chat-close-button message-button">X</button>
</div>
```

Replace with:
```typescript
<div class="chat-overlay-header">
  <span>Ask Me Anything</span>
  <div class="chat-header-actions">
    <a class="chat-resume-button" href="/resume.pdf" target="_blank" title="Download Resume (PDF)">📎</a>
    <button class="chat-close-button message-button">X</button>
  </div>
</div>
```

- [ ] **Step 4: Add CSS for the resume button and actions wrapper**

Add these styles to the chat CSS section in `public/index.html`, after `.chat-overlay-header`:

```css
.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-resume-button {
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
  color: #4d3b2e;
  display: flex;
  align-items: center;
}

.chat-resume-button:hover {
  color: #8b5a2b;
}
```

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors from `src/` directory.

- [ ] **Step 6: Commit**

```bash
git add src/types/Chat.ts src/modules/ChatWidget.ts public/index.html
git commit -m "feat: update ChatWidget for new profile sources and add resume button

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Update Entry Point

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update imports in index.ts**

Current `src/index.ts`:
```typescript
import Engine from './modules/Engine';
import { ChatWidget } from './modules/ChatWidget';
import { OPENROUTER_API_KEY as FILE_API_KEY } from './configs/apiKey';
import profileContent from './configs/profile.md';

declare const __OPENROUTER_API_KEY__: string;

const engine = new Engine('game-canvas');
engine.init();

const gameContainer = document.getElementById('canvas-container') as HTMLElement;

const chatWidget = new ChatWidget({
  profileContent,
  apiKey: __OPENROUTER_API_KEY__ || FILE_API_KEY,
  gameContainer,
});

chatWidget.init();
```

Replace with:
```typescript
import Engine from './modules/Engine';
import { ChatWidget } from './modules/ChatWidget';
import { OPENROUTER_API_KEY as FILE_API_KEY } from './configs/apiKey';
import profileCustomContent from './configs/profile.custom.md';
import profileData from './configs/profile.json';

declare const __OPENROUTER_API_KEY__: string;

const engine = new Engine('game-canvas');
engine.init();

const gameContainer = document.getElementById('canvas-container') as HTMLElement;

const chatWidget = new ChatWidget({
  profileCustomContent,
  profileData,
  apiKey: __OPENROUTER_API_KEY__ || FILE_API_KEY,
  gameContainer,
});

chatWidget.init();
```

- [ ] **Step 2: Full build verification**

Run: `npm run build`
Expected: Extraction script runs, then webpack bundles. Both succeed. The build output shows profile extraction summary before webpack starts.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: update entry point to use new profile sources

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Fix Game Degree Text

**Files:**
- Modify: `src/configs/maps/outside.ts`

- [ ] **Step 1: Update the professor interaction text**

In `src/configs/maps/outside.ts`, find lines ~216-232:

```typescript
text: `Professor: Hi Yan Myo Aung, you're back! I kept your Computer Science Degree around. Let me see...`,
```

Replace with:
```typescript
text: `Professor: Hi Yan Myo Aung! I've been keeping an eye on your NCC Education progress. Your L5DC is going well!`,
```

And the interactionBox title + textLines:
```typescript
title:
  "Computer Science Degree — NCC Education, Greenwich University",
textLines: [
  `- Software Engineering`,
  `- Data Structures & Algorithms`,
  `- Database Systems`,
  `- Object-Oriented Programming`,
  `- Web Development`,
],
```

Replace with:
```typescript
title:
  "NCC Education — L5DC (In Progress) | L4DC Diploma (Completed)",
textLines: [
  `- Software Engineering`,
  `- Data Structures & Algorithms`,
  `- Database Systems`,
  `- Object-Oriented Programming`,
  `- Web Development`,
],
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors from `src/`.

- [ ] **Step 3: Commit**

```bash
git add src/configs/maps/outside.ts
git commit -m "fix: update degree text to reflect L5DC in-progress status

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Full Build and End-to-End Verification

- [ ] **Step 1: Clean build**

```bash
rm -f src/configs/profile.json
npm run build
```

Expected: Extraction script runs → writes `profile.json` → webpack bundles successfully. Both succeed.

- [ ] **Step 2: Verify profile.json contents**

Run: `cat src/configs/profile.json`
Expected: JSON with skills array (13 entries), experience array (3 companies), education array, projects array (3 projects), links array (2 URLs), personal array (at least 1 statement).

- [ ] **Step 3: Start dev server**

Run: `npm start`
Expected: Server starts on port 3004. Game loads normally. Chat icon appears.

- [ ] **Step 4: Smoke test the chat**

In the browser:
1. Open chat → "Ask Me Anything" header with 📎 button visible
2. Click 📎 → opens `/resume.pdf` in new tab
3. Type "What technologies do you use?" → lists skills from game
4. Type "Tell me about your experience" → mentions PassionGeek, G-Next, Host Myanmar
5. Type "Can I see your resume?" → AI offers download link in first person
6. Type "What's the weather?" → politely redirects
7. Close chat → WASD movement works

- [ ] **Step 5: Verify game text fix**

Walk to the college/professor NPC interaction in the game. The professor text should say:
"Hi Yan Myo Aung! I've been keeping an eye on your NCC Education progress. Your L5DC is going well!"
And the interaction box title should show: "NCC Education — L5DC (In Progress) | L4DC Diploma (Completed)"

- [ ] **Step 6: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end verification

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
