import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KAGESTREAM Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0e1322] border border-violet-500/30 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white mb-2">
              KAGESTREAM
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              La plataforma ha detectado un problema al cargar los datos almacenados. Puedes recargar o restablecer los datos locales.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left p-3 mb-6 rounded-lg bg-black/50 text-violet-300 font-mono overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar página</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-medium text-sm transition-all"
                title="Limpiar almacenamiento local dañado"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar caché</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
