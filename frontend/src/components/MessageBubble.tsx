import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Cpu, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { role, content, tokensUsed, retrievedChunks, similarityScores } = message;
  const [copied, setCopied] = useState(false);

  const isUser = role === 'user';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      className={`flex w-full gap-4 p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-slate-900/40 border border-slate-800/50 self-end'
          : 'glass-panel border-l-4 border-l-brand-500 self-start'
      }`}
    >
      {/* Avatar Container */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-slate-700 to-slate-600 text-slate-100'
            : 'bg-gradient-to-tr from-brand-600 to-brand-400 text-white'
        }`}
      >
        {isUser ? 'U' : <Sparkles className="h-5 w-5" />}
      </div>

      {/* Message Body */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-sm font-semibold tracking-wide text-slate-300">
            {isUser ? 'You' : 'AeroRAG Intelligence'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {message.timestamp}
          </span>
        </div>

        {/* Markdown Content */}
        <div className="prose-custom text-slate-200 break-words select-text">
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>

        {/* Metadata & Telemetry Telemetric Badges for RAG (For Assistant Messages Only) */}
        {!isUser && (
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
            
            {/* RAG & LLM Metrics */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {tokensUsed !== undefined && tokensUsed > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <Cpu className="h-3 w-3 text-brand-400" />
                  <span>Tokens: {tokensUsed}</span>
                </span>
              )}

              {retrievedChunks !== undefined && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <FileText className="h-3 w-3 text-emerald-400" />
                  <span>Chunks: {retrievedChunks}</span>
                </span>
              )}

              {similarityScores && similarityScores.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <AlertCircle className="h-3 w-3 text-amber-400" />
                  <span>Max Score: {(Math.max(...similarityScores) * 100).toFixed(1)}%</span>
                </span>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900/60 hover:bg-brand-500/10 text-slate-400 hover:text-brand-300 border border-slate-800/80 hover:border-brand-500/30 transition-all"
                title="Copy response to clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MessageBubble;
