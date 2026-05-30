import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';
import { apiService } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  apiService: {
    sendMessage: jest.fn(),
    checkHealth: jest.fn(),
  },
}));

describe('AeroRAG React Frontend Application Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default health mock
    (apiService.checkHealth as jest.Mock).mockResolvedValue({ status: 'healthy' });
  });

  test('1. Renders executive dashboard correctly on initial mount', async () => {
    render(<App />);
    
    // Check main title presence
    expect(screen.getByText('AeroRAG Corporate Assistant')).toBeInTheDocument();
    
    // Check initial sidebar discussion history item
    expect(screen.getByText('New Discussion')).toBeInTheDocument();
    
    // Verify default instruction info card
    expect(screen.getByText(/Zero-Hallucination Guardrail/i)).toBeInTheDocument();
  });

  test('2. Typing text updates input element value', () => {
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Ask AeroRAG corporate documentation...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'How is confidential data handled?' } });
    
    expect(textarea.value).toBe('How is confidential data handled?');
  });

  test('3. Successful user message post and assistant grounded response rendering', async () => {
    // Mock successful reply
    (apiService.sendMessage as jest.Mock).mockResolvedValue({
      reply: 'Restricted data is encrypted at rest using AES-256.',
      tokensUsed: 64,
      retrievedChunks: 1,
      similarityScores: [0.88],
    });

    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Ask AeroRAG corporate documentation...');
    const sendButton = screen.getByTitle('Send message (Enter)');
    
    // Type query and press send
    fireEvent.change(textarea, { target: { value: 'What encryption do we use?' } });
    fireEvent.click(sendButton);
    
    // Check typing loading indicator appears
    expect(screen.getByText('AeroRAG is fetching and grounding response...')).toBeInTheDocument();
    
    // Wait for the mock API response to populate UI
    await waitFor(() => {
      expect(screen.getByText('Restricted data is encrypted at rest using AES-256.')).toBeInTheDocument();
    });
    
    // Verify RAG token telemetry metrics exist
    expect(screen.getByText('Tokens: 64')).toBeInTheDocument();
    expect(screen.getByText('Chunks: 1')).toBeInTheDocument();
    expect(screen.getByText('Max Score: 88.0%')).toBeInTheDocument();
  });

  test('4. Threshold failure triggers specific warning banner', async () => {
    // Mock threshold failed answer (0 chunks matched above 0.75 threshold)
    (apiService.sendMessage as jest.Mock).mockResolvedValue({
      reply: 'I could not find enough information in the knowledge base to answer this question.',
      tokensUsed: 0,
      retrievedChunks: 0,
      similarityScores: [0.45],
    });

    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Ask AeroRAG corporate documentation...');
    const sendButton = screen.getByTitle('Send message (Enter)');
    
    fireEvent.change(textarea, { target: { value: 'How to make a pizza?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('I could not find enough information in the knowledge base to answer this question.')).toBeInTheDocument();
    });
    
    // Verify toast notification alerts user
    expect(screen.getByText(/Search threshold limit not met/i)).toBeInTheDocument();
  });
});
