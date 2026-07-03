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
