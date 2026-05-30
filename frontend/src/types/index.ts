export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokensUsed?: number;
  retrievedChunks?: number;
  similarityScores?: number[];
}

export interface ChatSession {
  sessionId: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
  tokensUsed: number;
  retrievedChunks: number;
  similarityScores: number[];
}

export interface HealthResponse {
  status: string;
}

export interface SystemError {
  error: string;
  message: string;
  details?: any;
}
