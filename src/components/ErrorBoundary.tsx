import { ShieldAlert, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo } from 'react';

import { reportErrorToTelemetry } from '../error-handler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.PROD) {
      reportErrorToTelemetry(error.message, errorInfo?.componentStack || error.stack || '');
    } else {
      console.error('[ErrorBoundary dev]', error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none"
          id="error-boundary-container"
        >
          <div
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6"
            id="error-boundary-icon-wrapper"
          >
            <ShieldAlert className="w-12 h-12 stroke-[1.5]" id="error-boundary-icon" />
          </div>
          <h1
            className="text-2xl font-bold font-sans text-on-surface mb-2"
            id="error-boundary-title"
          >
            Something went wrong
          </h1>
          <p
            className="text-sm text-on-surface-variant max-w-sm mb-8 leading-relaxed"
            id="error-boundary-desc"
          >
            An unexpected error occurred in the view interface. We have automatically logged this
            event safely.
          </p>
          <button
            id="error-boundary-reload-btn"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 bg-[#00FFC2] hover:bg-[#00e6af] text-black font-semibold px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95 duration-100 cursor-pointer"
          >
            <RefreshCw className="w-4.5 h-4.5" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
