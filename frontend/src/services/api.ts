import axios, { AxiosError } from 'axios';
import { ChatRequest, ChatResponse, HealthResponse, SystemError } from '../types';

// Read API base URL from Vite environment, fallback to relative path (uses Vite proxy locally)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds gateway timeout
});

export const apiService = {
  /**
   * Posts user message to the RAG chat API
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    try {
      const payload: ChatRequest = { sessionId, message };
      const response = await client.post<ChatResponse>('/api/chat', payload);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  },

  /**
   * Evaluates server operational health state
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await client.get<HealthResponse>('/health');
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  },

  /**
   * Custom mapping of Axios and FastAPI structured errors,
   * securing database architectures and avoiding raw details leakage.
   */
  handleError(error: unknown): SystemError {
    const defaultError: SystemError = {
      error: 'NetworkError',
      message: 'Failed to communicate with the secure intelligence gateway.',
    };

    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<SystemError>;
      if (axiosErr.response) {
        // Safe mapping of the API's structured errors
        return {
          error: axiosErr.response.data?.error || 'ServerError',
          message: axiosErr.response.data?.message || 'The server encountered an issue processing the request.',
          details: axiosErr.response.data?.details,
        };
      } else if (axiosErr.request) {
        // Request made but no response received
        return {
          error: 'TimeoutError',
          message: 'The intelligence gateway failed to reply within the safety window.',
        };
      }
    }

    if (error instanceof Error) {
      return {
        error: 'ClientError',
        message: error.message,
      };
    }

    return defaultError;
  },
};
export default apiService;
