export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface UserInput {
  message: string;
  timestamp: Date;
} 