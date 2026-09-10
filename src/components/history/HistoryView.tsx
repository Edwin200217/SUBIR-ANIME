import React from 'react';
import { Clock, History, Play, Trash2 } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../../types/anime';

interface HistoryViewProps {
  history: WatchHistoryItem[];
  animes: Anime[];
  onPlayResume: (animeId: string, episodeNumber: number, progressSeconds: number) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  animes,
  onPlayResume,
  onDeleteItem,
  onClearAll,
}) => {
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDate = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div id="kagestream-history-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white flex items-center gap-3">
            <span>HISTORIAL DE VISUALIZACIÓN</span>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 font-mono font-bold">
              {history.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Continúa viendo tus animes desde el punto exacto donde los dejaste
          </p>
        </div>

        {history.length > 0 && (
          <button
            id="btn-clear-all-history"
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar todo el historial</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-panel border border-white/10 max-w-xl mx-auto">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xl font-display font-bold text-white mb-1">
            No tienes historial reciente
          </h3>
          <p className="text-xs text-slate-400">
            A medida que reproduzcas animes y películas, aquí se guardará tu avance automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10 hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.posterUrl}
                  alt={item.animeTitle}
                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover flex-shrink-0 bg-slate-800"
                />

                <div>
                  <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold mb-1">
                    <span>Episodio {item.episodeNumber}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{formatDate(item.lastWatched)}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {item.animeTitle}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                    {item.episodeTitle}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-32 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-cyan-300 font-bold">
                      {item.progressPercentage}%
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({formatTime(item.progressSeconds)} / {formatTime(item.durationSeconds)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <button
                  id={`btn-resume-history-${item.id}`}
                  onClick={() =>
                    onPlayResume(item.animeId, item.episodeNumber, item.progressSeconds)
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Continuar</span>
                </button>

                <button
                  id={`btn-delete-history-${item.id}`}
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all"
                  title="Eliminar de mi historial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
