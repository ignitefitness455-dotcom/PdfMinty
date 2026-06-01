import React, { Component, ReactNode } from "react";
import AlertTriangle from "lucide-react/icons/alert-triangle";
import RotateCcw from "lucide-react/icons/rotate-ccw";
import Home from "lucide-react/icons/home";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-8 text-center animate-fadein">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-450 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100 dark:border-rose-900/50">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-2">
                Oops, something went wrong!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                We encountered an unexpected rendering error. For your absolute privacy, your files remain strictly local on your device and were never uploaded anywhere.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer border-0 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reload Page
                </button>
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all decoration-none active:scale-95 border-0"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </a>
              </div>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer font-bold select-none hover:text-slate-600 transition">
                    Developer Diagnostic Details
                  </summary>
                  <pre className="mt-2.5 p-4 bg-slate-900 dark:bg-black text-slate-300 dark:text-slate-400 rounded-2xl text-xs overflow-auto max-h-48 font-mono border border-slate-800 select-all leading-relaxed">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
