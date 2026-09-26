/**
 * React Error Boundary
 * Catches React rendering errors and displays a fallback UI
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { errorLogger } from '@/lib/utils/error-logger';
import { GlassCard } from './ui/glass-card';
import { GoldButton } from './ui/gold-button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  source?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const source = this.props.source || 'ErrorBoundary';

    errorLogger.log(error, source, {
      component: errorInfo.componentStack,
      errorBoundary: source,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-gray-900 to-black">
          <GlassCard variant="dark" className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={40} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-400">
                  We encountered an unexpected error. Don&apos;t worry, we&apos;ve logged it and will fix it soon.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full bg-black/50 rounded-lg p-4 text-left">
                  <p className="text-red-400 font-mono text-sm mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-gold cursor-pointer hover:text-gold-400 text-sm">
                        View stack trace
                      </summary>
                      <pre className="text-gray-500 text-xs mt-2 overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-gold cursor-pointer hover:text-gold-400 text-sm">
                        View component stack
                      </summary>
                      <pre className="text-gray-500 text-xs mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-4 flex-wrap justify-center">
                <GoldButton
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw size={18} />
                  Try Again
                </GoldButton>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  <Home size={18} />
                  Go Home
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to wrap async operations with error logging
 */
export function useErrorHandler(source: string) {
  return React.useCallback((error: Error, context?: any) => {
    errorLogger.log(error, source, context);
  }, [source]);
}
