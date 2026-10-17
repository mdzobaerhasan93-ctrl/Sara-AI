import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SARA AI ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).finally(() => {
          window.location.reload();
        });
        return;
      }
    } catch (_) {}
    window.location.reload();
  };

  private handleSoftRecover = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#050512] text-slate-100 flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full rounded-3xl bg-slate-900/90 border border-pink-500/30 p-8 text-center space-y-6 shadow-[0_0_50px_rgba(255,46,147,0.25)] backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-300">
                SARA AI Interface Recovered
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                A rendering component encountered a glitch. Your data, settings, and memory are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-left overflow-auto max-h-32 text-[11px] font-mono text-pink-300/80">
                {this.state.error.message || 'Unknown render exception'}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleSoftRecover}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>Return to App</span>
              </button>
              <button
                onClick={this.handleReset}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,46,147,0.4)] transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload SARA</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
