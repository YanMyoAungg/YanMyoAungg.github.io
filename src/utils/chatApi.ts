import { ChatMessage, OpenRouterRequest, OpenRouterResponse } from '../types/Chat';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// 'openrouter/free' auto-routes to any available free model.
// The free model lineup changes frequently — if responses degrade,
// pick a specific model from: curl -s https://openrouter.ai/api/v1/models
const DEFAULT_MODEL = 'openrouter/free';
const MAX_HISTORY = 10;
const REQUEST_TIMEOUT_MS = 15_000;

// NOTE: The API key is embedded in client-side JS since this is a static
// portfolio with no backend. Use a restricted-scope key from OpenRouter
// and be aware it is visible in browser network requests and source view.
export class ChatApi {
  private apiKey: string;
  private model: string;
  private history: ChatMessage[];
  private systemMessage: ChatMessage;

  constructor(apiKey: string, profileContent: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
    this.history = [];
    this.systemMessage = this.buildSystemMessage(profileContent);
  }

  private buildSystemMessage(profileContent: string): ChatMessage {
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
        profileContent,
      ].join('\n'),
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
      // 401 = bad API key, 404 = bad model — surface the status
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
