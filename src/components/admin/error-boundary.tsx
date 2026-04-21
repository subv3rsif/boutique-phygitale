'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire page.
 *
 * This prevents session loss when client-side errors occur.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold mb-2">
                Une erreur est survenue
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <p className="text-sm">
                  Cette page a rencontré un problème. Vos modifications n'ont peut-être pas été sauvegardées.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-red-950/20 border border-red-900/30 rounded p-3 mt-3">
                    <p className="text-xs font-mono text-red-200 mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <pre className="text-xs font-mono text-red-300/80 overflow-x-auto mt-2 max-h-40">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={this.handleReset}
                    variant="destructive"
                    className="flex-1"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Recharger la page
                  </Button>
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="flex-1"
                  >
                    Retour
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
