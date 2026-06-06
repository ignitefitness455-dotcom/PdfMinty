import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import CheckCircle from 'lucide-react/icons/check-circle';
import AlertCircle from 'lucide-react/icons/alert-circle';
import Info from 'lucide-react/icons/info';
import X from 'lucide-react/icons/x';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const decrement = 100 / steps;

    const interval = setInterval(() => {
      setProgress(p => Math.max(0, p - decrement));
    }, intervalTime);

    const timeout = setTimeout(() => onRemove(toast.id), duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/45 border-emerald-100 dark:border-emerald-900/40 text-slate-800 dark:text-emerald-100 shadow-emerald-500/5',
    error: 'bg-rose-50 dark:bg-rose-950/45 border-rose-100 dark:border-rose-900/40 text-slate-800 dark:text-rose-100 shadow-rose-500/5',
    info: 'bg-blue-50 dark:bg-blue-950/45 border-blue-100 dark:border-blue-900/40 text-slate-800 dark:text-blue-100 shadow-blue-500/5',
  };

  const progressBarColors = {
    success: 'bg-emerald-500 dark:bg-emerald-450',
    error: 'bg-rose-500 dark:bg-rose-450',
    info: 'bg-blue-500 dark:bg-blue-450',
  };

  return (
    <div className={`relative flex items-center gap-3.5 px-4.5 py-4.5 rounded-2xl border shadow-lg font-sans text-left text-xs font-bold leading-normal animate-fadein selection:bg-transparent ${styles[toast.type]} max-w-sm w-full pointer-events-auto`}>
      {icons[toast.type]}
      <p className="flex-1 text-slate-700 dark:text-slate-200">{toast.message}</p>
      <button 
        type="button" 
        onClick={() => onRemove(toast.id)} 
        className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:scale-105 active:scale-95 transition-all p-1 rounded-lg cursor-pointer bg-transparent border-0"
        aria-label="Dismiss toast notification"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Dynamic Animated Remaining Duration Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl opacity-30 dark:opacity-25">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${progressBarColors[toast.type]}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration = 4000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast floating overlay container with z-index and support for both desktop & mobile notches */}
      <div className="fixed top-5 right-5 left-5 md:left-auto z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm ml-auto">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
