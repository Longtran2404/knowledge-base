/**
 * Production-Grade Error Boundary
 * Catches and handles React component errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent('Error Report - Nam Long Center');
    const body = encodeURIComponent(`
Error: ${error?.message || 'Unknown error'}

Stack Trace:
${error?.stack || 'No stack trace'}

Component Stack:
${errorInfo?.componentStack || 'No component stack'}

Browser: ${navigator.userAgent}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `);

    window.location.href = `mailto:tranminhlong2404@gmail.com?subject=${subject}&body=${body}`;
  };

  public render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <CardTitle className="text-2xl text-white">
                  Oops! Something went wrong
                </CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                We apologize for the inconvenience. An unexpected error occurred.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error count warning */}
              {errorCount > 3 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 text-sm">
                    ⚠️ Multiple errors detected ({errorCount}). Consider refreshing the page or contacting support.
                  </p>
                </div>
              )}

              {/* Error details (dev mode only) */}
              {showDetails && error && (
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-red-400">Error Message:</p>
                  <p className="text-sm text-slate-300 font-mono">{error.message}</p>

                  {error.stack && (
                    <>
                      <p className="text-sm font-semibold text-red-400 mt-4">Stack Trace:</p>
                      <pre className="text-xs text-slate-400 overflow-auto max-h-40 p-2 bg-slate-950 rounded">
                        {error.stack}
                      </pre>
                    </>
                  )}

                  {errorInfo?.componentStack && (
                    <>
                      <p className="text-sm font-semibold text-red-400 mt-4">Component Stack:</p>
                      <pre className="text-xs text-slate-400 overflow-auto max-h-40 p-2 bg-slate-950 rounded">
                        {errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* User-friendly message */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  💡 <strong>What you can do:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-200 text-sm mt-2 space-y-1">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Return to the home page</li>
                  <li>Report this issue if it persists</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Report Error
                </Button>
              </div>

              {/* Error ID for support */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  Error ID: {Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
