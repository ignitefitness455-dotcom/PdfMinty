import React, { Component, ReactNode } from "react";
import { sanitizeError } from "../error-handler";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error) {
    // Log to error tracking service (scrub PII first)
    const sanitized = sanitizeError(error);
    console.error("ErrorBoundary caught:", sanitized.message);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center" id="error-boundary-view">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred. No personal file data was affected.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
