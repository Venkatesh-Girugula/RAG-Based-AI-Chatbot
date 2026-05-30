import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  onClose, 
  type = 'error', 
  duration = 5000 
}) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    error: {
      bg: 'bg-red-950/80 border-red-500/30 text-red-200',
      icon: <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-950/80 border-amber-500/30 text-amber-200',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
    },
    info: {
      bg: 'bg-brand-950/80 border-brand-500/30 text-brand-200',
      icon: <Info className="h-5 w-5 text-brand-400 shrink-0" />
    }
  };

  const activeStyle = styles[type];

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-glass backdrop-blur-md animate-slide-in ${activeStyle.bg}`}>
      {activeStyle.icon}
      <div className="text-sm font-medium pr-4">{message}</div>
      <button 
        onClick={onClose} 
        className="ml-auto text-slate-400 hover:text-slate-100 p-0.5 rounded-lg hover:bg-white/10 transition-all"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
export default Toast;
