import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { sanitizeError } from "../error-handler";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    const { message } = sanitizeError(error);
    return { hasError: true, errorMessage: message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { message, stack } = sanitizeError(error);
    const sanitizedInfo = sanitizeError(errorInfo.componentStack || "");

    console.error("ErrorBoundary caught an error (scrubbed):", message, sanitizedInfo.message);

    // Dynamic Server Logging to PII-safe endpoint
    fetch("/api/error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        stack: stack || sanitizedInfo.message,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      }),
    }).catch((err) => {
      // Avoid infinite error loop if backend logging fails
      console.warn("Telemetry reporting was bypassed or offline:", err);
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-[50vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans"
          id="error-boundary-view"
        >
          <div className="max-w-md w-full space-y-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="flex justify-center">
              <span className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-2xl">
                <AlertCircle className="w-12 h-12" />
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              An unexpected error occurred
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              We've scrubbed and logged this error to ensure our security engineers resolve it. No personal file data was affected or transferred.
            </p>
            <div className="text-xs font-mono bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left overflow-auto max-h-36">
              <span className="font-bold text-rose-500">Error: </span>
              {this.state.errorMessage}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 dark:bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all shadow-md select-none cursor-pointer text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Application
              </button>
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-750 transition-all select-none no-underline text-sm"
              >
                <Home className="w-4 h-4" />
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
