import { ChatMessage, OpenRouterRequest, OpenRouterResponse } from '../types/Chat';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

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
