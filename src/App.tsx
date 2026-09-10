import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Clock,
  Film,
  Flame,
  LayoutGrid,
  Play,
  Plus,
  Sparkles,
  Tv,
  Upload,
} from 'lucide-react';
import { Anime, AuditLog, Banner, UserProfile, UserRole, WatchHistoryItem } from './types/anime';
import {
  clearAllContent,
  clearWatchHistory,
  deleteAnime,
  duplicateAnime,
  getAuditLogs,
  getCurrentUser,
  getStoredAnimes,
  getStoredBanners,
  getUserList,
  getWatchHistory,
  loadDemoContent,
  removeWatchHistoryItem,
  saveAnime,
  saveCurrentUser,
  toggleAnimePublish,
  toggleUserListItem,
} from './lib/storage';
import { NetflixIntro } from './components/intro/NetflixIntro';
import { DynamicBackground } from './components/background/DynamicBackground';
import { Navbar } from './components/navbar/Navbar';
import { Hero } from './components/hero/Hero';
import { AnimeCard } from './components/anime-card/AnimeCard';
import { LibraryView } from './components/library/LibraryView';
import { HistoryView } from './components/history/HistoryView';
import { UserListsView } from './components/lists/UserListsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VideoPlayer } from './components/player/VideoPlayer';
import { AnimeDetailsModal } from './components/details/AnimeDetailsModal';
import { UploadModal } from './components/upload/UploadModal';
import { EpisodeManagerModal } from './components/episodes/EpisodeManagerModal';
import { SearchModal } from './components/search/SearchModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [myListIds, setMyListIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Entrance Animation: plays dynamically on entry as requested by user
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const seen = sessionStorage.getItem('kagestream_seen_intro');
      return !seen;
    } catch {
      return true;
    }
  });

  // Player & Modals State
  const [playingAnime, setPlayingAnime] = useState<{
    anime: Anime;
    episodeNumber: number;
    progressSeconds: number;
  } | null>(null);

  const [detailsAnime, setDetailsAnime] = useState<Anime | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [episodeManagerAnime, setEpisodeManagerAnime] = useState<Anime | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string
  ) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reload data from storage
  const reloadData = () => {
    setAnimes(getStoredAnimes());
    setBanners(getStoredBanners());
    setWatchHistory(getWatchHistory());
    setMyListIds(getUserList('myList'));
    setFavoriteIds(getUserList('favorites'));
    setAuditLogs(getAuditLogs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Intro complete callback
  const handleIntroComplete = () => {
    sessionStorage.setItem('kagestream_seen_intro', 'true');
    setShowIntro(false);
  };

  // User list toggle
  const handleToggleMyList = (animeId: string) => {
    const isAdded = toggleUserListItem('myList', animeId);
    setMyListIds(getUserList('myList'));
    showToast(
      isAdded ? 'success' : 'info',
      isAdded ? 'Añadido a Mi Lista' : 'Eliminado de Mi Lista'
    );
  };

  const handleToggleFavorite = (animeId: string) => {
    const isAdded = toggleUserListItem('favorites', animeId);
    setFavoriteIds(getUserList('favorites'));
    showToast(
      isAdded ? 'success' : 'info',
      isAdded ? 'Añadido a Favoritos' : 'Eliminado de Favoritos'
    );
  };

  // Change active user role
  const handleChangeRole = (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    showToast('info', `Rol activo cambiado a: ${role}`);
  };

  // Save full profile
  const handleSaveProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    saveCurrentUser(updated);
  };

  // Background Scene Change
  const handleSelectBackgroundScene = (
    scene:
      | 'all_animes'
      | 'epic_battle'
      | 'cyberpunk'
      | 'sakura_forest'
      | 'ninja_shrine'
      | 'futuristic'
      | 'snow_mountain'
      | 'starry_sky'
  ) => {
    const updated: UserProfile = {
      ...currentUser,
      preferences: {
        ...currentUser.preferences,
        backgroundScene: scene,
      },
    };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    showToast('success', `Fondo anime actualizado: ${scene.replace('_', ' ')}`);
  };

  // Watch Player Trigger
  const handlePlayAnime = (anime: Anime, episodeNumber = 1, progressSeconds = 0) => {
    // If progress is not specified, check watch history for saved progress
    let startSeconds = progressSeconds;
    if (startSeconds === 0) {
      const matchHistory = watchHistory.find(
        (h) => h.animeId === anime.id && h.episodeNumber === episodeNumber
      );
      if (matchHistory && matchHistory.progressSeconds > 10) {
        startSeconds = matchHistory.progressSeconds;
      }
    }

    setPlayingAnime({
      anime,
      episodeNumber,
      progressSeconds: startSeconds,
    });
  };

  // Upload Anime Callback
  const handleAnimeUploaded = (newAnime: Anime) => {
    saveAnime(newAnime);
    reloadData();
    showToast('success', `"${newAnime.title}" se ha publicado con éxito`);
  };

  // Toggle Publish
  const handleTogglePublish = (animeId: string) => {
    const isPub = toggleAnimePublish(animeId);
    reloadData();
    showToast('info', isPub ? 'Contenido publicado' : 'Contenido ocultado');
  };

  // Duplicate Anime
  const handleDuplicate = (animeId: string) => {
    const copy = duplicateAnime(animeId);
    if (copy) {
      reloadData();
      showToast('success', `Copia creada: ${copy.title}`);
    }
  };

  // Delete Anime
  const handleDelete = (animeId: string) => {
    deleteAnime(animeId);
    reloadData();
    if (detailsAnime?.id === animeId) setDetailsAnime(null);
    if (playingAnime?.anime.id === animeId) setPlayingAnime(null);
    showToast('info', 'Publicación eliminada correctamente');
  };

  // Load DEMO Content
  const handleLoadDemo = () => {
    loadDemoContent();
    reloadData();
    showToast('success', 'Contenido DEMO cargado con éxito');
  };

  // Reset all to 0 items
  const handleResetAllData = () => {
    clearAllContent();
    reloadData();
    showToast('warning', 'Biblioteca restablecida a 0 títulos');
  };

  // Watch History Resume
  const handleResumeHistory = (
    animeId: string,
    episodeNumber: number,
    progressSeconds: number
  ) => {
    const target = animes.find((a) => a.id === animeId);
    if (target) {
      handlePlayAnime(target, episodeNumber, progressSeconds);
    } else {
      showToast('error', 'El anime ya no se encuentra en el catálogo');
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    removeWatchHistoryItem(id);
    setWatchHistory(getWatchHistory());
    showToast('info', 'Elemento eliminado del historial');
  };

  const handleClearAllHistory = () => {
    clearWatchHistory();
    setWatchHistory([]);
    showToast('info', 'Historial limpiado');
  };

  // Published animes for Home display
  const publishedAnimes = animes.filter((a) => a.isPublished);
  const recentAnimes = [...publishedAnimes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const popularAnimes = [...publishedAnimes].sort((a, b) => (b.views || 0) - (a.views || 0));
  const movieAnimes = publishedAnimes.filter((a) => a.type === 'Película');

  return (
    <div
      id="kagestream-app-root"
      className="min-h-screen text-slate-100 font-sans relative selection:bg-violet-600 selection:text-white"
    >
      {/* Dynamic Visual Parallax Anime Background */}
      {currentUser?.preferences?.animatedBackground && (
        <DynamicBackground
          scene={currentUser?.preferences?.backgroundScene || 'all_animes'}
          enabled={currentUser?.preferences?.animatedBackground}
          animes={publishedAnimes}
          activeAnime={publishedAnimes[0]}
        />
      )}

      {/* Netflix Entrance Intro Animation */}
      {showIntro && (
        <NetflixIntro
          onComplete={handleIntroComplete}
          reduceMotion={currentUser?.preferences?.reduceMotion}
        />
      )}

      {/* Persistent Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onChangeRole={handleChangeRole}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onSelectBackgroundScene={handleSelectBackgroundScene}
        unreadCount={0}
      />

      {/* MAIN CONTENT VIEWS ROUTING */}
      <main className="relative z-10 min-h-screen pb-16">
        {/* VIEW 1: HOME (Inicio) */}
        {currentTab === 'home' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Hero Section (Handles empty initial state or featured banner) */}
            <Hero
              animes={publishedAnimes}
              banners={banners}
              onOpenUpload={() => setUploadModalOpen(true)}
              onExploreLibrary={() => setCurrentTab('library')}
              onPlayAnime={handlePlayAnime}
              onViewDetails={(a) => setDetailsAnime(a)}
              onToggleMyList={handleToggleMyList}
              inMyList={(id) => myListIds.includes(id)}
              onLoadDemoContent={handleLoadDemo}
            />

            {/* If there are titles, render modern categorized streaming rails */}
            {publishedAnimes.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-8">
                {/* Rail: Continuar Viendo (if watch history exists) */}
                {watchHistory.length > 0 && (
                  <section id="section-continue-watching" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                          Continuar Viendo
                        </h2>
                      </div>
                      <button
                        onClick={() => setCurrentTab('history')}
                        className="text-xs font-semibold text-violet-400 hover:text-violet-300"
                      >
                        Ver historial completo →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {watchHistory.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() =>
                            handleResumeHistory(
                              item.animeId,
                              item.episodeNumber,
                              item.progressSeconds
                            )
                          }
                          className="group relative flex items-center gap-3 p-2.5 rounded-xl glass-panel border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.06] transition-all cursor-pointer"
                        >
                          <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                            <img
                              src={item.posterUrl}
                              alt={item.animeTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60">
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${item.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex-grow min-w-0">
                            <div className="text-[10px] text-cyan-300 font-mono font-bold">
                              Ep. {item.episodeNumber} • {item.progressPercentage}%
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                              {item.animeTitle}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {item.episodeTitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Rail: Tendencias / Populares */}
                <section id="section-popular-animes" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                        Tendencias en KAGESTREAM
                      </h2>
                    </div>
                    <button
                      onClick={() => setCurrentTab('library')}
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300"
                    >
                      Explorar todo →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {popularAnimes.slice(0, 6).map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onPlay={handlePlayAnime}
                        onViewDetails={(a) => setDetailsAnime(a)}
                        onToggleMyList={handleToggleMyList}
                        isInList={myListIds.includes(anime.id)}
                        canDelete={true}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>

                {/* Rail: Últimos Añadidos */}
                <section id="section-recent-animes" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                        Últimos Añadidos
                      </h2>
                    </div>
                    <button
                      onClick={() => setCurrentTab('library')}
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300"
                    >
                      Ver biblioteca →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {recentAnimes.slice(0, 6).map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onPlay={handlePlayAnime}
                        onViewDetails={(a) => setDetailsAnime(a)}
                        onToggleMyList={handleToggleMyList}
                        isInList={myListIds.includes(anime.id)}
                        canDelete={true}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>

                {/* Rail: Películas (if any) */}
                {movieAnimes.length > 0 && (
                  <section id="section-movies" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-indigo-400" />
                        <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                          Películas Cinematográficas
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {movieAnimes.slice(0, 6).map((anime) => (
                        <AnimeCard
                          key={anime.id}
                          anime={anime}
                          onPlay={handlePlayAnime}
                          onViewDetails={(a) => setDetailsAnime(a)}
                          onToggleMyList={handleToggleMyList}
                          isInList={myListIds.includes(anime.id)}
                          canDelete={true}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: BIBLIOTECA (Library) */}
        {(currentTab === 'library' ||
          currentTab === 'anime' ||
          currentTab === 'movies' ||
          currentTab === 'series') && (
          <LibraryView
            animes={animes}
            onPlayAnime={handlePlayAnime}
            onViewDetails={(a) => setDetailsAnime(a)}
            onToggleMyList={handleToggleMyList}
            inMyList={(id) => myListIds.includes(id)}
            onOpenUpload={() => setUploadModalOpen(true)}
            onLoadDemoContent={handleLoadDemo}
            canDelete={true}
            onDeleteAnime={handleDelete}
          />
        )}

        {/* VIEW 3: HISTORIAL (Watch History) */}
        {currentTab === 'history' && (
          <HistoryView
            history={watchHistory}
            animes={animes}
            onPlayResume={handleResumeHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
          />
        )}

        {/* VIEW 4: MIS COLECCIONES / LISTA */}
        {currentTab === 'my-list' && (
          <UserListsView
            animes={animes}
            myListIds={myListIds}
            favoriteIds={favoriteIds}
            watchHistory={watchHistory}
            onPlayAnime={handlePlayAnime}
            onViewDetails={(a) => setDetailsAnime(a)}
            onToggleMyList={handleToggleMyList}
            onOpenUpload={() => setUploadModalOpen(true)}
            onDeleteAnime={handleDelete}
          />
        )}

        {/* VIEW 5: ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <AdminDashboard
            animes={animes}
            currentUser={currentUser}
            auditLogs={auditLogs}
            banners={banners}
            onOpenUpload={() => setUploadModalOpen(true)}
            onEditAnime={(a) => {
              setUploadModalOpen(true);
            }}
            onManageEpisodes={(a) => setEpisodeManagerAnime(a)}
            onTogglePublish={handleTogglePublish}
            onDuplicateAnime={handleDuplicate}
            onDeleteAnime={handleDelete}
            onLoadDemo={handleLoadDemo}
            onResetAllData={handleResetAllData}
            showToast={showToast}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#05070d]/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">KAGESTREAM</span>
            <span>—</span>
            <span>Tu universo anime comienza aquí</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('library')}
              className="hover:text-slate-300 transition-colors"
            >
              Biblioteca
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="hover:text-slate-300 transition-colors"
            >
              Panel Admin
            </button>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Configuración
            </button>
          </div>
        </div>
      </footer>

      {/* FULLSCREEN VIDEO PLAYER */}
      {playingAnime && (
        <VideoPlayer
          anime={playingAnime.anime}
          initialEpisodeNumber={playingAnime.episodeNumber}
          initialProgressSeconds={playingAnime.progressSeconds}
          onClose={() => {
            setPlayingAnime(null);
            setWatchHistory(getWatchHistory());
          }}
          showToast={showToast}
        />
      )}

      {/* ANIME DETAILS MODAL */}
      <AnimeDetailsModal
        anime={detailsAnime}
        onClose={() => setDetailsAnime(null)}
        onPlayEpisode={(anime, epNum) => {
          setDetailsAnime(null);
          handlePlayAnime(anime, epNum);
        }}
        onToggleMyList={handleToggleMyList}
        onToggleFavorite={handleToggleFavorite}
        isInList={detailsAnime ? myListIds.includes(detailsAnime.id) : false}
        isFavorite={detailsAnime ? favoriteIds.includes(detailsAnime.id) : false}
        showToast={showToast}
        canDelete={true}
        onDeleteAnime={handleDelete}
      />

      {/* UPLOAD MODAL (DRAG & DROP S3-COMPLIANT PROCESSOR) */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSaveAnime={handleAnimeUploaded}
        showToast={showToast}
      />

      {/* EPISODES MANAGER MODAL */}
      <EpisodeManagerModal
        anime={episodeManagerAnime}
        isOpen={!!episodeManagerAnime}
        onClose={() => setEpisodeManagerAnime(null)}
        onUpdateAnime={(updated) => {
          saveAnime(updated);
          reloadData();
          setEpisodeManagerAnime(null);
        }}
        showToast={showToast}
      />

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        animes={publishedAnimes}
        onSelectAnime={(anime) => setDetailsAnime(anime)}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* PROFILE & SETTINGS MODAL */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
        showToast={showToast}
      />

      {/* TOAST SYSTEM ALERTS */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
