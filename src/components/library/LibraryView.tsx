import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Filter,
  Grid,
  Inbox,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Anime, ContentType } from '../../types/anime';
import { AnimeCard } from '../anime-card/AnimeCard';

interface LibraryViewProps {
  animes: Anime[];
  onPlayAnime: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  onToggleMyList: (animeId: string) => void;
  inMyList: (animeId: string) => boolean;
  onOpenUpload: () => void;
  onLoadDemoContent: () => void;
  onDeleteAnime?: (animeId: string) => void;
  canDelete?: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  animes,
  onPlayAnime,
  onViewDetails,
  onToggleMyList,
  inMyList,
  onOpenUpload,
  onLoadDemoContent,
  onDeleteAnime,
  canDelete = false,
}) => {
  const [selectedType, setSelectedType] = useState<string>('Todo');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Counts
  const totalTitles = animes.length;
  const totalEpisodes = animes.reduce(
    (acc, a) => acc + (a.seasons?.reduce((eAcc, s) => eAcc + (s.episodes?.length || 0), 0) || 0),
    0
  );
  const totalMovies = animes.filter((a) => a.type === 'Película').length;

  // Filter & Sort logic
  const filteredAnimes = useMemo(() => {
    return animes
      .filter((a) => {
        if (!a.isPublished) return false;
        // Filter by Type
        if (selectedType !== 'Todo') {
          if (selectedType === 'Subidos') return a.isUploadedByUser || !a.isDemo;
          if (selectedType === 'Anime' && a.type !== 'Serie') return false;
          if (selectedType === 'Películas' && a.type !== 'Película') return false;
          if (selectedType === 'Series' && a.type !== 'Serie') return false;
          if (selectedType === 'OVA' && a.type !== 'OVA') return false;
          if (selectedType === 'Especiales' && a.type !== 'Especial') return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = a.title.toLowerCase().includes(q);
          const matchesAlt = a.altTitle?.toLowerCase().includes(q);
          const matchesGenre = a.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchesTitle && !matchesAlt && !matchesGenre) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'az') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'za') {
          return b.title.localeCompare(a.title);
        }
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === 'year') {
          return b.year - a.year;
        }
        return 0;
      });
  }, [animes, selectedType, searchQuery, sortBy]);

  const filterTabs = ['Todo', 'Subidos', 'Anime', 'Películas', 'Series', 'OVA', 'Especiales'];

  return (
    <div id="kagestream-library-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-14">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
            <span>MI BIBLIOTECA</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 font-mono font-bold">
              {totalTitles} TÍTULOS
            </span>
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
            <span>{totalTitles} títulos</span>
            <span>•</span>
            <span>{totalEpisodes} episodios</span>
            <span>•</span>
            <span>{totalMovies} películas</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-library-upload-action"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-900/40 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Subir Contenido</span>
          </button>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              id={`filter-tab-${tab.toLowerCase()}`}
              onClick={() => setSelectedType(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === tab
                  ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.35)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search, Sort and Layout Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Input */}
          <div className="relative min-w-[180px] flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por título o género..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-slate-900">Más recientes</option>
              <option value="az" className="bg-slate-900">A - Z</option>
              <option value="za" className="bg-slate-900">Z - A</option>
              <option value="views" className="bg-slate-900">Más vistos</option>
              <option value="year" className="bg-slate-900">Año de estreno</option>
            </select>
          </div>

          {/* Grid / List Mode */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1 rounded-lg transition-colors ${
                layoutMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Vista cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1 rounded-lg transition-colors ${
                layoutMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Vista lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CASE 1: EMPTY STATE */}
      {totalTitles === 0 ? (
        <div
          id="library-empty-box"
          className="py-14 px-4 rounded-2xl border border-dashed border-white/15 glass-panel flex flex-col items-center justify-center text-center max-w-lg mx-auto"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-violet-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <h3 className="text-xl font-display font-bold text-white mb-1.5">
            Tu biblioteca está vacía
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Sube tu primer contenido para comenzar o carga el contenido de demostración para explorar la plataforma.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-empty-upload-action"
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>SUBIR ANIME</span>
            </button>

            <button
              id="btn-empty-demo-action"
              onClick={onLoadDemoContent}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-violet-300 hover:text-white border border-violet-500/30 font-semibold text-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cargar DEMO de prueba</span>
            </button>
          </div>
        </div>
      ) : filteredAnimes.length === 0 ? (
        /* No Search Matches */
        <div className="py-12 text-center rounded-2xl glass-panel border border-white/10 p-6">
          <p className="text-base text-white font-semibold mb-1">
            ¿No encontraste lo que buscabas?
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Tu biblioteca todavía no tiene contenido que coincida con "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        /* Anime Grid / List */
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filteredAnimes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onPlay={onPlayAnime}
              onViewDetails={onViewDetails}
              onToggleMyList={onToggleMyList}
              isInList={inMyList(anime.id)}
              layoutMode={layoutMode}
              canDelete={canDelete || anime.isUploadedByUser}
              onDelete={onDeleteAnime}
            />
          ))}
        </div>
      )}
    </div>
  );
};
