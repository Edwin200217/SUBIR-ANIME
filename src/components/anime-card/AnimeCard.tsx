import React from 'react';
import { Check, Info, Play, Plus, Trash2 } from 'lucide-react';
import { Anime } from '../../types/anime';

interface AnimeCardProps {
  anime: Anime;
  onPlay: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  onToggleMyList: (animeId: string) => void;
  isInList: boolean;
  layoutMode?: 'grid' | 'list';
  canDelete?: boolean;
  onDelete?: (animeId: string) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onPlay,
  onViewDetails,
  onToggleMyList,
  isInList,
  layoutMode = 'grid',
  canDelete = false,
  onDelete,
}) => {
  // Episode count calculation
  const totalEpisodes =
    anime.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) ||
    (anime.type === 'Película' ? 1 : 0);

  // Check if it's new (created in the last 14 days)
  const isNew =
    anime.createdAt &&
    Date.now() - new Date(anime.createdAt).getTime() < 14 * 86400000;

  // An anime is deletable if canDelete flag is given OR if uploaded by user
  const isDeletable = (canDelete || anime.isUploadedByUser) && Boolean(onDelete);

  if (layoutMode === 'list') {
    return (
      <div
        id={`anime-list-card-${anime.id}`}
        className="group relative flex flex-col sm:flex-row items-stretch gap-3 p-2.5 rounded-xl glass-panel glass-panel-hover border border-white/10 transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg"
      >
        {/* Poster Thumbnail */}
        <div
          onClick={() => onViewDetails(anime)}
          className="relative w-full sm:w-36 h-48 sm:h-auto rounded-lg overflow-hidden cursor-pointer flex-shrink-0 bg-slate-900"
        >
          <img
            src={anime.posterUrl || anime.bannerUrl}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-cyan-300 font-mono">
              {anime.quality || '1080P'}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-col justify-between flex-grow py-0.5 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[11px]">
              <span className="font-semibold text-violet-400">{anime.type}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{anime.year}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400/90 font-medium">{anime.status}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {totalEpisodes > 0 ? `${totalEpisodes} eps` : 'En preparación'}
              </span>
              {anime.isUploadedByUser && (
                <span className="px-1.5 py-0.2 rounded bg-violet-600/30 text-violet-300 border border-violet-500/40 text-[9px] font-bold">
                  SUBIDO
                </span>
              )}
            </div>

            <h3
              onClick={() => onViewDetails(anime)}
              className="text-base font-display font-bold text-white group-hover:text-violet-300 cursor-pointer transition-colors line-clamp-1"
            >
              {anime.title}
            </h3>

            {anime.altTitle && (
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-1">
                {anime.altTitle}
              </p>
            )}

            <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed mb-2">
              {anime.description}
            </p>

            <div className="flex flex-wrap gap-1">
              {anime.genres?.slice(0, 4).map((g) => (
                <span
                  key={g}
                  className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              id={`btn-play-${anime.id}`}
              onClick={() => onPlay(anime)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Ver</span>
            </button>

            <button
              id={`btn-toggle-list-${anime.id}`}
              onClick={() => onToggleMyList(anime.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all"
            >
              {isInList ? (
                <>
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>En lista</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>Mi lista</span>
                </>
              )}
            </button>

            {isDeletable && (
              <button
                id={`btn-delete-list-${anime.id}`}
                onClick={() => onDelete?.(anime.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-medium transition-all"
                title="Borrar publicación"
              >
                <Trash2 className="w-3 h-3" />
                <span>Borrar</span>
              </button>
            )}

            <button
              id={`btn-details-${anime.id}`}
              onClick={() => onViewDetails(anime)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all ml-auto"
              title="Ver detalles"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: COMPACT GRID CARD
  return (
    <div
      id={`anime-grid-card-${anime.id}`}
      className="group relative rounded-xl overflow-hidden glass-panel border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(139,92,246,0.2)] hover:border-violet-500/40 flex flex-col"
    >
      {/* Aspect Ratio 3:4 Poster Image Container */}
      <div
        onClick={() => onViewDetails(anime)}
        className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer bg-slate-900"
      >
        <img
          src={anime.posterUrl || anime.bannerUrl}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient shadow for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/40 opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-cyan-400/40 text-[9px] font-bold text-cyan-300 font-mono shadow-sm">
              {anime.quality || '1080P'}
            </span>
            {isNew && (
              <span className="px-1 py-0.5 rounded bg-violet-600/90 text-[8px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                NUEVO
              </span>
            )}
            {anime.isUploadedByUser && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-[8px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                SUBIDO
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            {isDeletable && (
              <button
                id={`btn-card-delete-quick-${anime.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(anime.id);
                }}
                className="p-1 rounded-md bg-red-950/80 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white transition-all shadow-md"
                title="Borrar esta publicación"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-bold text-amber-300 border border-amber-500/30">
              {anime.rating}
            </span>
          </div>
        </div>

        {/* Hover Quick Overlay Controls */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-transparent">
          <div className="flex items-center gap-1.5 mb-2">
            <button
              id={`btn-card-play-${anime.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(anime);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Ver</span>
            </button>

            <button
              id={`btn-card-list-${anime.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMyList(anime.id);
              }}
              className="p-1.5 rounded-lg glass-panel hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white transition-all"
              title={isInList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
            >
              {isInList ? (
                <Check className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>

            {isDeletable && (
              <button
                id={`btn-card-delete-${anime.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(anime.id);
                }}
                className="p-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white transition-all"
                title="Borrar publicación"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
            {anime.description}
          </p>
        </div>
      </div>

      {/* Bottom Information (Compact) */}
      <div className="p-2.5 flex flex-col flex-grow justify-between bg-[#0b0e18]/85">
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-0.5">
            <span>{anime.year} • {anime.type}</span>
            <span className="text-violet-400 font-semibold">
              {totalEpisodes > 0 ? `${totalEpisodes} eps` : 'En curso'}
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(anime)}
            className="text-xs sm:text-sm font-display font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 cursor-pointer"
            title={anime.title}
          >
            {anime.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1 mt-1.5">
          {anime.genres?.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[9px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5"
            >
              {g}
            </span>
          ))}
          {anime.genres?.length > 2 && (
            <span className="text-[9px] text-slate-500 px-1 py-0.5">
              +{anime.genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
