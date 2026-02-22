import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full bg-card rounded-2xl shadow-strong p-8 text-center border border-border">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">
              Đã xảy ra lỗi
            </h1>

            <p className="text-muted-foreground mb-6">
              Xin lỗi, đã có lỗi xảy ra khi tải trang. Vui lòng thử lại sau.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Chi tiết lỗi (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-red-600 overflow-auto">
                  <div className="font-semibold mb-2">Error:</div>
                  <div className="mb-2">{this.state.error.message}</div>
                  <div className="font-semibold mb-2">Stack:</div>
                  <div className="whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

// Error page component
interface ErrorPageProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ErrorPage({
  title = "Đã xảy ra lỗi",
  message = "Xin lỗi, đã có lỗi xảy ra khi tải trang. Vui lòng thử lại sau.",
  error,
  onRetry,
  onGoHome,
}: ErrorPageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-strong p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {error && process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Chi tiết lỗi (Development)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-red-600 overflow-auto">
              <div className="font-semibold mb-2">Error:</div>
              <div className="mb-2">{error.message}</div>
              <div className="font-semibold mb-2">Stack:</div>
              <div className="whitespace-pre-wrap">{error.stack}</div>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetry}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>

          <Button onClick={handleGoHome} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
