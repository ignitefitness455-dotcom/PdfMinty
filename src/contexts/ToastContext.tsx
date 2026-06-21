import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return safe fallback so dev mode never crashes if called outside Provider
    return {
      showToast: (message: string, type?: 'success' | 'error') => {
        console.log(`[Toast] ${type?.toUpperCase()}: ${message}`);
      },
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          id="toast-notification"
          className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all transform animate-bounce ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
