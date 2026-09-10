import React, { useState } from 'react';
import { Bookmark, CheckCircle2, Clock, Heart, Upload } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../../types/anime';
import { AnimeCard } from '../anime-card/AnimeCard';

interface UserListsViewProps {
  animes: Anime[];
  myListIds: string[];
  favoriteIds: string[];
  watchHistory: WatchHistoryItem[];
  onPlayAnime: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  onToggleMyList: (animeId: string) => void;
  onOpenUpload: () => void;
  onDeleteAnime?: (animeId: string) => void;
}

export const UserListsView: React.FC<UserListsViewProps> = ({
  animes,
  myListIds,
  favoriteIds,
  watchHistory,
  onPlayAnime,
  onViewDetails,
  onToggleMyList,
  onOpenUpload,
  onDeleteAnime,
}) => {
  const [activeTab, setActiveTab] = useState<'myList' | 'uploads' | 'favorites' | 'continue' | 'completed'>('myList');

  // Filter lists
  const myListAnimes = animes.filter((a) => myListIds.includes(a.id));
  const favoriteAnimes = animes.filter((a) => favoriteIds.includes(a.id));
  // Uploaded animes: marked as uploaded by user or user-created non-demo
  const uploadedAnimes = animes.filter((a) => a.isUploadedByUser || !a.isDemo);
  const continueWatchingAnimes = animes.filter((a) =>
    watchHistory.some((h) => h.animeId === a.id && h.progressPercentage < 90)
  );
  const completedAnimes = animes.filter((a) =>
    watchHistory.some((h) => h.animeId === a.id && h.progressPercentage >= 90)
  );

  const tabs = [
    { id: 'myList', label: 'Mi lista', count: myListAnimes.length, icon: Bookmark },
    { id: 'uploads', label: 'Mis publicaciones', count: uploadedAnimes.length, icon: Upload },
    { id: 'favorites', label: 'Favoritos', count: favoriteAnimes.length, icon: Heart },
    { id: 'continue', label: 'Continuar viendo', count: continueWatchingAnimes.length, icon: Clock },
    { id: 'completed', label: 'Terminados', count: completedAnimes.length, icon: CheckCircle2 },
  ];

  const currentList =
    activeTab === 'myList'
      ? myListAnimes
      : activeTab === 'uploads'
      ? uploadedAnimes
      : activeTab === 'favorites'
      ? favoriteAnimes
      : activeTab === 'continue'
      ? continueWatchingAnimes
      : completedAnimes;

  return (
    <div id="kagestream-user-lists-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
            <span>MIS COLECCIONES</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organiza tus animes guardados, publicaciones subidas y progreso de reproducción
          </p>
        </div>

        {activeTab === 'uploads' && (
          <button
            id="btn-upload-from-collections"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir nueva publicación</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Explanatory Info Banner for Uploads */}
      {activeTab === 'uploads' && uploadedAnimes.length > 0 && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-300 flex items-center justify-between gap-3">
          <span>
            Aquí puedes gestionar y borrar tus publicaciones subidas. Pulsa el icono de papelera en cualquier tarjeta para eliminarla.
          </span>
          <span className="font-mono text-[11px] text-cyan-300 whitespace-nowrap">
            {uploadedAnimes.length} {uploadedAnimes.length === 1 ? 'título' : 'títulos'}
          </span>
        </div>
      )}

      {/* Grid or Empty */}
      {currentList.length === 0 ? (
        <div className="py-14 text-center rounded-2xl glass-panel border border-white/10 max-w-md mx-auto p-6">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
          <h3 className="text-lg font-display font-bold text-white mb-1">
            {activeTab === 'uploads' ? 'No tienes publicaciones subidas' : 'Esta sección está vacía'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            {activeTab === 'uploads'
              ? 'Aún no has subido ningún anime o película. Haz clic abajo para publicar tu primer contenido.'
              : 'Añade animes a tu lista pulsando en el botón "+" de las tarjetas o detalles.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-md shadow-violet-900/40 hover:bg-violet-500 transition-all"
          >
            Subir nuevo contenido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {currentList.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onPlay={onPlayAnime}
              onViewDetails={onViewDetails}
              onToggleMyList={onToggleMyList}
              isInList={myListIds.includes(anime.id)}
              canDelete={activeTab === 'uploads' || anime.isUploadedByUser}
              onDelete={onDeleteAnime}
            />
          ))}
        </div>
      )}
    </div>
  );
};
