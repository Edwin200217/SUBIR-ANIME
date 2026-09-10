import React, { useState } from 'react';
import {
  Check,
  Heart,
  Play,
  Plus,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { Anime, Episode } from '../../types/anime';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface AnimeDetailsModalProps {
  anime: Anime | null;
  onClose: () => void;
  onPlayEpisode: (anime: Anime, episodeNumber: number) => void;
  onToggleMyList: (animeId: string) => void;
  onToggleFavorite: (animeId: string) => void;
  isInList: boolean;
  isFavorite: boolean;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
  canDelete?: boolean;
  onDeleteAnime?: (animeId: string) => void;
}

export const AnimeDetailsModal: React.FC<AnimeDetailsModalProps> = ({
  anime,
  onClose,
  onPlayEpisode,
  onToggleMyList,
  onToggleFavorite,
  isInList,
  isFavorite,
  showToast,
  canDelete = false,
  onDeleteAnime,
}) => {
  if (!anime) return null;

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const seasons = anime.seasons || [];
  const currentSeason =
    seasons.find((s) => s.seasonNumber === selectedSeasonNumber) || seasons[0];
  const episodes: Episode[] = currentSeason?.episodes || [];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Enlace copiado al portapapeles', `Compartiendo ${anime.title}`);
    } else {
      showToast('info', `Enlace de ${anime.title} listo`);
    }
  };

  const isDeletable = (canDelete || anime.isUploadedByUser) && Boolean(onDeleteAnime);

  const handleConfirmDelete = () => {
    if (onDeleteAnime) {
      onDeleteAnime(anime.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <div
        id="anime-details-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <div className="relative w-full max-w-4xl my-auto bg-[#090c16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            id="btn-close-details"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-grow">
            {/* Panoramic Banner Header */}
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-900">
              <img
                src={anime.bannerUrl || anime.posterUrl}
                alt={anime.title}
                className="w-full h-full object-cover object-center filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090c16] via-[#090c16]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090c16] via-[#090c16]/30 to-transparent" />

              {/* Bottom Badges & Title on Banner */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-violet-600 font-extrabold text-[11px] text-white">
                      {anime.type}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/40">
                      {anime.quality || '1080P'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                      {anime.rating}
                    </span>
                    <span className="text-xs text-slate-300">
                      {anime.year} • {anime.status}
                    </span>
                    {anime.isUploadedByUser && (
                      <span className="px-2 py-0.5 rounded bg-indigo-600/90 text-[10px] font-bold text-white uppercase">
                        Subido por mí
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-3xl font-display font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {anime.title}
                  </h1>
                  {anime.altTitle && (
                    <p className="text-xs text-violet-300/90 font-medium mt-0.5">
                      {anime.altTitle}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-details-play-first"
                    onClick={() => onPlayEpisode(anime, 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>REPRODUCIR</span>
                  </button>

                  <button
                    id="btn-details-toggle-list"
                    onClick={() => onToggleMyList(anime.id)}
                    className={`p-2 rounded-xl glass-panel hover:bg-white/20 border transition-all ${
                      isInList ? 'border-violet-400 text-violet-300' : 'border-white/20 text-slate-200'
                    }`}
                    title={isInList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
                  >
                    {isInList ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    id="btn-details-toggle-favorite"
                    onClick={() => onToggleFavorite(anime.id)}
                    className={`p-2 rounded-xl glass-panel hover:bg-white/20 border transition-all ${
                      isFavorite ? 'border-pink-500 text-pink-400' : 'border-white/20 text-slate-200'
                    }`}
                    title={isFavorite ? 'En favoritos' : 'Marcar como favorito'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-pink-500' : ''}`} />
                  </button>

                  <button
                    id="btn-details-share"
                    onClick={handleShare}
                    className="p-2 rounded-xl glass-panel hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white transition-all"
                    title="Compartir"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Borrar publicación button */}
                  {isDeletable && (
                    <button
                      id="btn-details-delete-publication"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-semibold transition-all shadow-md active:scale-95"
                      title="Borrar esta publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Borrar publicación</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Synopsis & Meta Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                    Sinopsis
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {anime.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {anime.genres?.map((genre) => (
                      <span
                        key={genre}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="p-3.5 rounded-xl glass-panel border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between pb-1.5 border-b border-white/5">
                    <span className="text-slate-400">Estado</span>
                    <span className="text-slate-200 font-medium">{anime.status}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-white/5">
                    <span className="text-slate-400">Estreno</span>
                    <span className="text-slate-200 font-medium">{anime.year}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-white/5">
                    <span className="text-slate-400">Audio</span>
                    <span className="text-slate-200 font-medium">
                      {anime.audioLanguages?.join(', ') || 'Japonés, Español'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-white/5">
                    <span className="text-slate-400">Subtítulos</span>
                    <span className="text-slate-200 font-medium">
                      {anime.subtitlesLanguages?.join(', ') || 'Español, Inglés'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Visualizaciones</span>
                    <span className="text-slate-200 font-mono font-bold">
                      {anime.views?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE EPISODIOS */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-display font-bold text-white">
                      Episodios
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 text-[11px] font-mono font-bold">
                      {episodes.length} disponibles
                    </span>
                  </div>

                  {/* Season tabs if multiple seasons */}
                  {seasons.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      {seasons.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            selectedSeasonNumber === s.seasonNumber
                              ? 'bg-violet-600 text-white'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Episodes Grid */}
                {episodes.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border border-dashed border-white/15 bg-white/[0.02]">
                    <p className="text-slate-400 text-xs">
                      No hay episodios registrados en esta temporada aún.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {episodes.map((ep) => (
                      <div
                        key={ep.id}
                        onClick={() => onPlayEpisode(anime, ep.episodeNumber)}
                        className="group relative flex items-center gap-3 p-2 rounded-xl glass-panel border border-white/10 hover:border-violet-500/50 hover:bg-white/[0.06] transition-all cursor-pointer"
                      >
                        {/* Thumbnail with play overlay */}
                        <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                          <img
                            src={ep.thumbnailUrl || anime.posterUrl}
                            alt={ep.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-md">
                              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-slate-200">
                            {ep.durationFormatted || '24:00'}
                          </span>
                        </div>

                        {/* Episode Information */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-violet-400 font-semibold mb-0.5">
                            <span>Ep. {ep.episodeNumber}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-[9px] font-mono text-cyan-300">
                              {ep.quality || '1080p'}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                            {ep.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {ep.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title={anime.title}
        message="¿Estás seguro de que deseas borrar esta publicación? Esta acción eliminará permanentemente este anime de tu biblioteca y no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
