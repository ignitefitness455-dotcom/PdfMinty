import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
      {/* Visual Toast overlay */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none md:max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => removeToast(toast.id)}
                className={`pointer-events-auto relative group overflow-hidden p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border text-sm cursor-pointer transition-all flex items-start gap-3 backdrop-blur-md ${
                  isSuccess
                    ? "bg-slate-50/90 dark:bg-slate-900/90 border-emerald-500/20 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/5"
                    : isError
                    ? "bg-slate-50/90 dark:bg-slate-900/90 border-rose-500/20 text-rose-900 dark:text-rose-100 shadow-rose-500/5"
                    : "bg-slate-50/90 dark:bg-slate-900/90 border-slate-300/30 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* Accent line on left side */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isSuccess
                      ? "bg-emerald-500"
                      : isError
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                />

                <div className="flex-1 flex gap-3 pl-1.5">
                  <div className="mt-0.5 shrink-0">
                    {isSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isError ? (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Info className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-extrabold text-xs tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-0.5">
                      {isSuccess ? "Success" : isError ? "Error" : "Notification"}
                    </p>
                    <p className="text-xs leading-relaxed font-bold font-sans">
                      {toast.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="shrink-0 p-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Progress bar at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/50">
                  <div
                    className={`h-full ${
                      isSuccess
                        ? "bg-emerald-500"
                        : isError
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                    style={{
                      animation: "shrink 4s linear forwards",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
