import React, { useState } from 'react';
import {
  Film,
  FolderPlus,
  Plus,
  Trash2,
  Tv,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { Anime, Episode, Season } from '../../types/anime';

interface EpisodeManagerModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAnime: (updated: Anime) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const EpisodeManagerModal: React.FC<EpisodeManagerModalProps> = ({
  anime,
  isOpen,
  onClose,
  onUpdateAnime,
  showToast,
}) => {
  if (!isOpen || !anime) return null;

  const [seasons, setSeasons] = useState<Season[]>(
    anime.seasons && anime.seasons.length > 0
      ? anime.seasons
      : [
          {
            id: `season_${anime.id}_1`,
            seasonNumber: 1,
            title: 'Temporada 1',
            episodes: [],
          },
        ]
  );

  const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(1);

  // New Episode Form State
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpDescription, setNewEpDescription] = useState('');
  const [newEpVideoUrl, setNewEpVideoUrl] = useState('');
  const [newEpThumbnailUrl, setNewEpThumbnailUrl] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('24:00');

  const activeSeason =
    seasons.find((s) => s.seasonNumber === activeSeasonNumber) || seasons[0];

  const handleAddSeason = () => {
    const newSeasonNum = seasons.length + 1;
    const newSeason: Season = {
      id: `season_${anime.id}_${newSeasonNum}`,
      seasonNumber: newSeasonNum,
      title: `Temporada ${newSeasonNum}`,
      episodes: [],
    };
    const updated = [...seasons, newSeason];
    setSeasons(updated);
    setActiveSeasonNumber(newSeasonNum);
    showToast('success', `Temporada ${newSeasonNum} añadida`);
  };

  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpTitle.trim()) {
      showToast('error', 'El episodio necesita un título');
      return;
    }

    const currentEps = activeSeason.episodes || [];
    const nextEpNumber = currentEps.length + 1;

    const newEpisode: Episode = {
      id: `ep_${anime.id}_s${activeSeason.seasonNumber}_e${nextEpNumber}_${Date.now()}`,
      animeId: anime.id,
      seasonNumber: activeSeason.seasonNumber,
      episodeNumber: nextEpNumber,
      title: newEpTitle,
      description: newEpDescription || `Episodio ${nextEpNumber} de ${anime.title}`,
      videoUrl:
        newEpVideoUrl ||
        anime.videoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: newEpThumbnailUrl || anime.posterUrl,
      duration: 1440,
      durationFormatted: newEpDuration,
      quality: '1080p',
      subtitles: [],
      createdAt: new Date().toISOString(),
    };

    const updatedSeasons = seasons.map((s) => {
      if (s.seasonNumber === activeSeason.seasonNumber) {
        return {
          ...s,
          episodes: [...(s.episodes || []), newEpisode],
        };
      }
      return s;
    });

    setSeasons(updatedSeasons);
    setNewEpTitle('');
    setNewEpDescription('');
    setNewEpVideoUrl('');
    setNewEpThumbnailUrl('');
    showToast('success', `Episodio ${nextEpNumber} añadido`);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    const updatedSeasons = seasons.map((s) => {
      if (s.seasonNumber === activeSeason.seasonNumber) {
        return {
          ...s,
          episodes: (s.episodes || []).filter((e) => e.id !== episodeId),
        };
      }
      return s;
    });
    setSeasons(updatedSeasons);
    showToast('info', 'Episodio eliminado');
  };

  const handleSaveAll = () => {
    const updatedAnime: Anime = {
      ...anime,
      seasons,
      updatedAt: new Date().toISOString(),
    };
    onUpdateAnime(updatedAnime);
    showToast('success', 'Episodios y temporadas actualizadas correctamente');
    onClose();
  };

  return (
    <div
      id="episode-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl my-auto bg-[#090c16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-violet-400" />
              <span>Gestionar Episodios: {anime.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra temporadas, añade nuevos capítulos o edita metadatos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Seasons Navigation Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSeasonNumber(s.seasonNumber)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeSeasonNumber === s.seasonNumber
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {s.title} ({s.episodes?.length || 0})
                </button>
              ))}
            </div>

            <button
              onClick={handleAddSeason}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Temporada</span>
            </button>
          </div>

          {/* Add New Episode Form */}
          <form
            onSubmit={handleAddEpisode}
            className="p-4 rounded-2xl glass-panel border border-violet-500/20 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Añadir Nuevo Episodio a {activeSeason.title}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Título del episodio *
                </label>
                <input
                  type="text"
                  required
                  value={newEpTitle}
                  onChange={(e) => setNewEpTitle(e.target.value)}
                  placeholder="Ej. El Despertar del Guerrero"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Duración aproximada
                </label>
                <input
                  type="text"
                  value={newEpDuration}
                  onChange={(e) => setNewEpDuration(e.target.value)}
                  placeholder="Ej. 24:15"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  URL o Fuente de Video
                </label>
                <input
                  type="text"
                  value={newEpVideoUrl}
                  onChange={(e) => setNewEpVideoUrl(e.target.value)}
                  placeholder="URL MP4 o enlace de streaming..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Miniatura URL (Opcional)
                </label>
                <input
                  type="text"
                  value={newEpThumbnailUrl}
                  onChange={(e) => setNewEpThumbnailUrl(e.target.value)}
                  placeholder="URL de imagen de vista previa..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                + Añadir Episodio
              </button>
            </div>
          </form>

          {/* Current Episodes List in Active Season */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Lista de Episodios ({activeSeason.episodes?.length || 0})
            </h4>

            {activeSeason.episodes?.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-xs text-slate-500">
                  Esta temporada aún no tiene episodios. Utiliza el formulario superior para añadir uno.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeSeason.episodes?.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between p-3 rounded-xl glass-panel border border-white/5 text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center font-mono font-bold">
                        {ep.episodeNumber}
                      </span>
                      <img
                        src={ep.thumbnailUrl || anime.posterUrl}
                        alt={ep.title}
                        className="w-12 h-8 rounded object-cover bg-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white line-clamp-1">{ep.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {ep.durationFormatted} • {ep.quality}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEpisode(ep.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg"
                      title="Eliminar episodio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.01]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-300 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-900/40"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
