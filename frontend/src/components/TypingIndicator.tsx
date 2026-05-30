import React from 'react';
import { Sparkles } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full gap-4 p-5 rounded-2xl glass-panel border-l-4 border-l-brand-400 self-start animate-pulse">
      {/* Avatar Container */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md">
        <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      {/* Indicator Animation */}
      <div className="flex flex-col flex-1 justify-center">
        <span className="text-sm font-semibold tracking-wide text-brand-300 mb-2">
          AeroRAG is fetching and grounding response...
        </span>
        <div className="flex items-center gap-1.5 py-1">
          <div className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
export default TypingIndicator;
