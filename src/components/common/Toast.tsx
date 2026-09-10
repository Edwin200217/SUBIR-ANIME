import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="kagestream-toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-[#07130f]/95 text-emerald-100',
    error: 'border-red-500/40 bg-[#160a0a]/95 text-red-100',
    warning: 'border-amber-500/40 bg-[#171206]/95 text-amber-100',
    info: 'border-cyan-500/40 bg-[#07121b]/95 text-cyan-100',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-fade-in transition-all ${borders[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-grow min-w-0">
        <h4 className="text-xs sm:text-sm font-bold">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs opacity-80 mt-0.5 line-clamp-2 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/50 hover:text-white flex-shrink-0 p-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
