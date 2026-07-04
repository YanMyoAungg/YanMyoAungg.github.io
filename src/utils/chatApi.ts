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
    // Also strip markdown we can't render (plain-text chat widget).
    const assistantMessage = rawMessage
      .replace(/^User\s+safety:\s*safe\.?\s*/i, '')
      .replace(/^\s*<thinking>[\s\S]*?<\/thinking>\s*/i, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/\*{3}(.+?)\*{3}/g, '$1')
      .replace(/\*{2}(.+?)\*{2}/g, '$1')
      .replace(/_{2}(.+?)_{2}/g, '$1')
      .trim() || 'Sorry, I could not generate a response.';

    this.history.push({ role: 'user', content: trimmed });
    this.history.push({ role: 'assistant', content: assistantMessage });
    return assistantMessage;
  }

  clearHistory(): void {
    this.history = [];
  }
}
