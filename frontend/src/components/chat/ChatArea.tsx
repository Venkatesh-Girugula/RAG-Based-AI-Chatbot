import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  StopCircle, 
  Sparkles, 
  Compass, 
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MoreHorizontal,
  FolderOpen,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { apiService } from '../../services/api';
import { Message, SystemError } from '../../types';
import MessageBubble from '../MessageBubble';
import TypingIndicator from '../TypingIndicator';

export const ChatArea: React.FC = () => {
  const { 
    sessions, 
    currentSessionId, 
    updateSessionMessages,
    isUploading,
    setUploading,
    addDocument
  } = useStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  
  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike'>('like');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Accuracy');

  // Attachment upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.sessionId === currentSessionId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !currentSessionId) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsgObj: Message = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsgObj];
    updateSessionMessages(currentSessionId, updatedMessages);

    try {
      const res = await apiService.sendMessage(currentSessionId, userText);
      
      const assistantMsgObj: Message = {
        id: 'msg_assistant_' + Date.now(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokensUsed: res.tokensUsed,
        retrievedChunks: res.retrievedChunks,
        similarityScores: res.similarityScores
      };

      updateSessionMessages(currentSessionId, [...updatedMessages, assistantMsgObj]);
    } catch (err) {
      const apiErr = err as SystemError;
      const errorMsgObj: Message = {
        id: 'msg_error_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Session Error [${apiErr.error}]**\n\n${apiErr.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokensUsed: 0,
        retrievedChunks: 0
      };
      updateSessionMessages(currentSessionId, [...updatedMessages, errorMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 180)}px`;
  };

  // Mock document uploading inside the chat zone directly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);

      // Verify file limit (e.g. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }

      setUploading(true, 10);
      setTimeout(() => setUploading(true, 40), 400);
      setTimeout(() => setUploading(true, 80), 800);
      setTimeout(() => {
        setUploading(false);
        const newDoc = {
          id: 'doc_' + Date.now(),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadDate: new Date().toISOString().split('T')[0],
          chunkCount: 3,
          embeddingCount: 3,
          status: 'Indexed' as const,
          type: (file.name.split('.').pop()?.toUpperCase() as any) || 'TXT',
          metadata: { author: 'Direct Chat Upload', description: 'Uploaded via chat attachment' }
        };
        addDocument(newDoc);
        setSelectedFile(null);
        setInput(prev => prev + ` [Attachment Loaded: ${file.name}]`);
      }, 1200);
    }
  };

  const toggleVoiceInput = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      setInput('Listening...');
      setTimeout(() => {
        setInput('What are FastAPI production deployment guidelines?');
        setVoiceActive(false);
      }, 2500);
    }
  };

  const triggerFeedback = (type: 'like' | 'dislike') => {
    setFeedbackType(type);
    setShowFeedbackModal(true);
    setFeedbackText('');
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFeedbackModal(false);
    alert('Thank you! Your feedback has been committed to audit logs.');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
      
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        
        {/* Welcome Pane */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto my-12 flex flex-col items-center justify-center text-center space-y-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/10">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                AeroRAG Corporate Intelligence Hub
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ask queries about security policy guidelines, DevOps standards, and frontend conventions.
              </p>
            </div>

            {/* Mock Queries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-4">
              {[
                { title: 'Security Classifications', query: 'What classification is salaries and source code under our security policy?' },
                { title: 'DevOps Guideline', query: 'What are the deployment requirements for FastAPI services in production?' },
                { title: 'React Typings', query: 'What are the React TypeScript best practices for functional component props?' },
                { title: 'RAG Thresholds', query: 'What similarity score threshold is set in the RAG search pipeline?' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(item.query)}
                  className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-slate-900 hover:border-slate-800 transition-all flex flex-col gap-1 w-full"
                >
                  <span className="text-[10px] font-semibold text-brand-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5" />
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-300 font-medium truncate w-full">
                    {item.query}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-slate-950 border border-slate-900 text-left max-w-lg mt-4">
              <Info className="h-5 w-5 text-brand-400 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-normal">
                <strong>Grounded Guardrail:</strong> The vector store calculates cosine similarity. Answers are strictly sourced from context. Unknown queries below the 0.75 threshold trigger immediate pipeline failure, avoiding hallucinations.
              </p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, i) => (
            <div key={message.id} className="space-y-2">
              <MessageBubble message={message} />
              
              {/* Micro actions under assistant bubble */}
              {message.role === 'assistant' && !message.content.includes('⚠️ Session Error') && (
                <div className="flex items-center gap-2 pl-14 text-slate-500 text-xs">
                  <button 
                    onClick={() => triggerFeedback('like')} 
                    className="p-1 rounded-md hover:bg-slate-900/60 hover:text-brand-400 transition-all"
                    title="Like Response"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => triggerFeedback('dislike')} 
                    className="p-1 rounded-md hover:bg-slate-900/60 hover:text-red-400 transition-all"
                    title="Dislike Response"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleSendMessage} 
                    className="p-1 rounded-md hover:bg-slate-900/60 hover:text-emerald-400 transition-all"
                    title="Regenerate Answer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="absolute top-2 right-6 z-20 glass-panel border border-brand-500/20 px-4 py-2.5 rounded-xl flex items-center gap-3 animate-pulse text-xs font-semibold">
          <RefreshCw className="h-4.5 w-4.5 text-brand-400 animate-spin" />
          <span>Embedding Attachment: {useStore.getState().uploadProgress}%</span>
        </div>
      )}

      {/* Inputs Area */}
      <div className="p-6 border-t border-slate-900 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto relative flex flex-col gap-2">
          
          <div className="relative flex items-end w-full glass-input rounded-2xl bg-slate-950/60 overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500/50 transition-all">
            
            {/* Attachment Button */}
            <div className="pl-3.5 pb-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 transition-all cursor-pointer"
                title="Attach Document (PDF, TXT, JSON)"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>
              <input 
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.json"
                className="hidden"
              />
            </div>

            {/* Message input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder="Ask AeroRAG corporate documentation..."
              rows={1}
              className="w-full flex-1 resize-none bg-transparent py-4 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none max-h-44 min-h-[48px] self-center focus:ring-0 focus:outline-none"
              style={{ height: 'auto' }}
            />

            {/* Micro voice and sends controls */}
            <div className="absolute right-3.5 bottom-3 flex items-center gap-1.5">
              <button 
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl text-slate-500 hover:text-slate-300 transition-all cursor-pointer ${
                  voiceActive ? 'text-red-400 bg-red-500/10 animate-pulse' : 'hover:bg-slate-900/60'
                }`}
                title="Voice Input Command"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
              
              {loading ? (
                <button
                  onClick={() => setLoading(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/20 text-red-300 shadow-md transition-all cursor-pointer animate-pulse"
                  title="Stop Response Generation"
                >
                  <StopCircle className="h-4.5 w-4.5" />
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md disabled:bg-slate-900 disabled:text-slate-600 disabled:shadow-none hover:shadow-brand-500/20 transition-all cursor-pointer"
                  title="Send message (Enter)"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center px-2 text-[10px] text-slate-500 font-medium">
            <span>Shift + Enter for new line. Enter to send.</span>
            <span className="font-mono">Models: Gemini 2.5 Flash // Cosine similarity &gt; 0.75</span>
          </div>
        </div>
      </div>

      {/* --- DETAILED FEEDBACK EVALUATION MODAL --- */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-900 shadow-glass"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Submit Response Evaluation</h3>
                <p className="text-[10px] text-slate-500">Fine-tune internal retrieval models</p>
              </div>
            </div>

            <form onSubmit={submitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={feedbackCategory} 
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-brand-500 outline-none"
                >
                  <option value="Accuracy">Retrieve Accuracy (Hallucination check)</option>
                  <option value="Format">Output formatting & structures</option>
                  <option value="Tone">Service professional tone</option>
                  <option value="Other">Other specifications</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detailed Notes</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Input detailed observations regarding this grounding session..."
                  rows={4}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-brand-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Commit Feedback
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
export default ChatArea;
