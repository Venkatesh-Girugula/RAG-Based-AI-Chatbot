import { Message } from './index';

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Moderator' | 'Admin';
  status: 'Active' | 'Suspended';
  joinedDate: string;
  avatarColor: string;
}

export interface EnterpriseDocument {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  chunkCount: number;
  embeddingCount: number;
  status: 'Indexed' | 'Processing' | 'Failed';
  type: 'PDF' | 'DOCX' | 'TXT' | 'JSON';
  metadata: {
    author?: string;
    description?: string;
    tags?: string[];
  };
}

export interface TokenUsageMetric {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: string;
}

export interface SystemHealthState {
  api: 'online' | 'degraded' | 'offline';
  database: 'online' | 'degraded' | 'offline';
  vectorDb: 'online' | 'degraded' | 'offline';
  embeddings: 'online' | 'degraded' | 'offline';
  llm: 'online' | 'degraded' | 'offline';
}

export interface EnterpriseModelSettings {
  modelName: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  retrievalThreshold: number;
  chunkSize: number;
  chunkOverlap: number;
}

export interface ChatFolder {
  id: string;
  name: string;
  sessionIds: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}
