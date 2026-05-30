import { create } from 'zustand';
import { 
  EnterpriseUser, 
  EnterpriseDocument, 
  EnterpriseModelSettings, 
  ChatFolder, 
  AuditLog,
  SystemHealthState
} from '../types/enterprise';
import { Message, ChatSession } from '../types';

interface EnterpriseState {
  // Navigation & Authentication
  isAuthenticated: boolean;
  currentUser: EnterpriseUser | null;
  activeTab: 'chat' | 'knowledge' | 'admin' | 'analytics' | 'users' | 'model' | 'system' | 'profile';
  authScreen: 'login' | 'register' | 'forgot' | 'verify' | 'success';
  rememberMe: boolean;

  // Active Chats & Folders
  sessions: ChatSession[];
  currentSessionId: string;
  folders: ChatFolder[];
  searchQuery: string;

  // Knowledge Base
  documents: EnterpriseDocument[];
  isUploading: boolean;
  uploadProgress: number;
  selectedDocId: string | null;

  // Model Configurations
  modelSettings: EnterpriseModelSettings;

  // Admin & User Management
  users: EnterpriseUser[];
  auditLogs: AuditLog[];
  systemHealth: SystemHealthState;

  // Actions
  setAuthScreen: (screen: 'login' | 'register' | 'forgot' | 'verify' | 'success') => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  setRememberMe: (val: boolean) => void;
  setActiveTab: (tab: 'chat' | 'knowledge' | 'admin' | 'analytics' | 'users' | 'model' | 'system' | 'profile') => void;
  
  // Chat Actions
  createNewSession: (title?: string) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  setCurrentSessionId: (id: string) => void;
  updateSessionMessages: (sessionId: string, messages: Message[]) => void;
  setSearchQuery: (query: string) => void;
  renameSession: (id: string, newTitle: string) => void;

  // Knowledge Base Actions
  addDocument: (doc: EnterpriseDocument) => void;
  deleteDocument: (id: string) => void;
  setUploading: (val: boolean, progress?: number) => void;
  setSelectedDocId: (id: string | null) => void;

  // Setting Actions
  updateModelSettings: (settings: Partial<EnterpriseModelSettings>) => void;
  resetModelSettings: () => void;

  // Admin Actions
  suspendUser: (id: string) => void;
  activateUser: (id: string) => void;
  changeUserRole: (id: string, role: 'User' | 'Moderator' | 'Admin') => void;
  triggerSystemHealthRefresh: () => void;
}

const DEFAULT_MODEL_SETTINGS: EnterpriseModelSettings = {
  modelName: 'models/gemini-2.5-flash',
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxTokens: 2048,
  retrievalThreshold: 0.75,
  chunkSize: 500,
  chunkOverlap: 50,
};

export const useStore = create<EnterpriseState>((set) => ({
  // --- INITIAL STATES ---
  isAuthenticated: false,
  currentUser: null,
  activeTab: 'chat',
  authScreen: 'login',
  rememberMe: false,

  sessions: [],
  currentSessionId: '',
  folders: [
    { id: 'f1', name: 'Security Audits', sessionIds: [] },
    { id: 'f2', name: 'DevOps Rules', sessionIds: [] }
  ],
  searchQuery: '',

  documents: [
    {
      id: 'doc_1',
      name: 'SecOps-Policy-2026.pdf',
      size: '2.4 MB',
      uploadDate: '2026-05-30',
      chunkCount: 14,
      embeddingCount: 14,
      status: 'Indexed',
      type: 'PDF',
      metadata: { author: 'Security Team', description: 'Data Classification policy and criteria.' }
    },
    {
      id: 'doc_2',
      name: 'DevOps-FastAPI-Deploy.md',
      size: '420 KB',
      uploadDate: '2026-05-30',
      chunkCount: 8,
      embeddingCount: 8,
      status: 'Indexed',
      type: 'TXT',
      metadata: { author: 'DevOps Guild', description: 'Production deployment checklist for FastAPI' }
    },
    {
      id: 'doc_3',
      name: 'Frontend-Standard-v2.md',
      size: '850 KB',
      uploadDate: '2026-05-30',
      chunkCount: 12,
      embeddingCount: 12,
      status: 'Indexed',
      type: 'TXT',
      metadata: { author: 'UX Guild', description: 'TypeScript and Component guidelines.' }
    }
  ],
  isUploading: false,
  uploadProgress: 0,
  selectedDocId: null,

  modelSettings: DEFAULT_MODEL_SETTINGS,

  users: [
    { id: 'usr_1', name: 'Venkat Raman', email: 'venky@enterprise.io', role: 'Admin', status: 'Active', joinedDate: '2026-01-10', avatarColor: 'bg-indigo-600' },
    { id: 'usr_2', name: 'Sarah Connor', email: 'sarah.c@enterprise.io', role: 'Moderator', status: 'Active', joinedDate: '2026-02-15', avatarColor: 'bg-emerald-600' },
    { id: 'usr_3', name: 'John Doe', email: 'john.doe@enterprise.io', role: 'User', status: 'Active', joinedDate: '2026-03-01', avatarColor: 'bg-amber-600' },
    { id: 'usr_4', name: 'Marcus Wright', email: 'marcus.w@enterprise.io', role: 'User', status: 'Suspended', joinedDate: '2026-04-18', avatarColor: 'bg-rose-600' }
  ],

  auditLogs: [
    { id: 'log_1', userId: 'usr_1', userName: 'Venkat Raman', action: 'Modified similarity search threshold to 0.75', timestamp: '2026-05-30 14:22:18', ipAddress: '192.168.1.42' },
    { id: 'log_2', userId: 'usr_1', userName: 'Venkat Raman', action: 'Uploaded document SecOps-Policy-2026.pdf', timestamp: '2026-05-30 11:05:44', ipAddress: '192.168.1.42' },
    { id: 'log_3', userId: 'usr_2', userName: 'Sarah Connor', action: 'Suspended user Marcus Wright', timestamp: '2026-05-29 09:41:12', ipAddress: '192.168.1.88' }
  ],

  systemHealth: {
    api: 'online',
    database: 'online',
    vectorDb: 'online',
    embeddings: 'online',
    llm: 'online',
  },

  // --- ACTIONS ---
  setAuthScreen: (screen) => set({ authScreen: screen }),
  
  login: (email, name) => set({ 
    isAuthenticated: true, 
    currentUser: {
      id: 'usr_active',
      name: name || 'Venkat Raman',
      email: email,
      role: email === 'admin@enterprise.io' ? 'Admin' : 'User',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      avatarColor: 'bg-brand-600'
    }
  }),

  logout: () => set({ isAuthenticated: false, currentUser: null, activeTab: 'chat' }),
  
  setRememberMe: (val) => set({ rememberMe: val }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),

  createNewSession: (title) => set((state) => {
    const newId = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const newSession: ChatSession = {
      sessionId: newId,
      title: title || 'New Discussion',
      messages: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    return {
      sessions: [newSession, ...state.sessions],
      currentSessionId: newId
    };
  }),

  deleteSession: (id) => set((state) => {
    const filtered = state.sessions.filter(s => s.sessionId !== id);
    let newCurrentId = state.currentSessionId;
    if (state.currentSessionId === id) {
      newCurrentId = filtered.length > 0 ? filtered[0].sessionId : '';
    }
    return {
      sessions: filtered,
      currentSessionId: newCurrentId
    };
  }),

  clearAllSessions: () => set({ sessions: [], currentSessionId: '' }),

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  updateSessionMessages: (sessionId, messages) => set((state) => ({
    sessions: state.sessions.map(s => 
      s.sessionId === sessionId 
        ? { ...s, messages: messages.slice(-10) } // Enforce memory constraint
        : s
    )
  })),

  renameSession: (id, newTitle) => set((state) => ({
    sessions: state.sessions.map(s => 
      s.sessionId === id 
        ? { ...s, title: newTitle } 
        : s
    )
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),

  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter(d => d.id !== id)
  })),

  setUploading: (val, progress = 0) => set({ isUploading: val, uploadProgress: progress }),
  
  setSelectedDocId: (id) => set({ selectedDocId: id }),

  updateModelSettings: (settings) => set((state) => ({
    modelSettings: { ...state.modelSettings, ...settings }
  })),

  resetModelSettings: () => set({ modelSettings: DEFAULT_MODEL_SETTINGS }),

  suspendUser: (id) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, status: 'Suspended' } : u)
  })),

  activateUser: (id) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, status: 'Active' } : u)
  })),

  changeUserRole: (id, role) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, role } : u)
  })),

  triggerSystemHealthRefresh: () => set((state) => {
    // Simulates randomized real-time refresh updates for a production look
    const statuses: ('online' | 'degraded')[] = ['online', 'degraded'];
    return {
      systemHealth: {
        api: 'online',
        database: 'online',
        vectorDb: Math.random() > 0.85 ? 'degraded' : 'online',
        embeddings: 'online',
        llm: Math.random() > 0.9 ? 'degraded' : 'online',
      }
    };
  })
}));
