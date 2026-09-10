import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message = 'Esta acción no se puede deshacer. El contenido se eliminará permanentemente de tu biblioteca.',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#0e111a] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">
              ¿Eliminar este contenido?
            </h3>
            <p className="text-xs text-red-300/80 font-medium">{title}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            id="btn-cancel-delete"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all"
          >
            CANCELAR
          </button>
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-900/50 transition-all active:scale-95"
          >
            ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
};
