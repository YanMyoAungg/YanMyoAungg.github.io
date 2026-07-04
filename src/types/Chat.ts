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
    role: 'assistant';
    content: string;
  };
}

export interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

export interface ChatWidgetConfig {
  profileCustomContent: string;
  profileData: Record<string, unknown>;
  apiKey: string;
  gameContainer: HTMLElement;
  model?: string;
}
