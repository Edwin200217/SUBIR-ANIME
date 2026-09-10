import React, { useMemo, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import { Anime } from '../../types/anime';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  animes: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onOpenUpload: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  animes,
  onSelectAnime,
  onOpenUpload,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    animes.forEach((a) => a.genres?.forEach((g) => set.add(g)));
    return ['Todos', ...Array.from(set)];
  }, [animes]);

  const searchResults = useMemo(() => {
    if (!query.trim() && selectedGenre === 'Todos' && selectedType === 'Todos') {
      return [];
    }

    const q = query.toLowerCase().trim();
    return animes.filter((a) => {
      if (!a.isPublished) return false;
      if (selectedGenre !== 'Todos' && !a.genres?.includes(selectedGenre)) return false;
      if (selectedType !== 'Todos' && a.type !== selectedType) return false;

      if (!q) return true;
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchAlt = a.altTitle?.toLowerCase().includes(q);
      const matchYear = String(a.year).includes(q);
      const matchGenre = a.genres?.some((g) => g.toLowerCase().includes(q));
      const matchStatus = a.status.toLowerCase().includes(q);

      return matchTitle || matchAlt || matchYear || matchGenre || matchStatus;
    });
  }, [animes, query, selectedGenre, selectedType]);

  return (
    <div
      id="search-modal-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-3xl bg-[#090c16] border border-violet-500/30 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-violet-400" />
          <input
            id="main-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, género, año, temporada, tipo o estado..."
            className="w-full bg-transparent text-white text-base sm:text-lg placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-white/5 bg-white/[0.01] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1">
            Género:
          </span>
          {allGenres.slice(0, 8).map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-grow">
          {searchResults.length > 0 ? (
            <div className="space-y-2.5">
              {searchResults.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => {
                    onSelectAnime(anime);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3 rounded-2xl glass-panel hover:bg-white/10 border border-white/5 hover:border-violet-500/40 cursor-pointer transition-all"
                >
                  <img
                    src={anime.posterUrl || anime.bannerUrl}
                    alt={anime.title}
                    className="w-14 h-18 rounded-xl object-cover flex-shrink-0 bg-slate-800"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                      <span className="text-violet-400 font-semibold">{anime.type}</span>
                      <span>•</span>
                      <span>{anime.year}</span>
                      <span>•</span>
                      <span className="text-amber-400">{anime.status}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                      {anime.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {anime.genres.join(', ')}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-violet-600/30 text-violet-300">
                    <Play className="w-4 h-4 fill-violet-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            /* Prompt requested Empty Search Message */
            <div className="py-12 text-center">
              <p className="text-base text-white font-semibold mb-1">
                ¿No encontraste lo que buscabas?
              </p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
                Tu biblioteca todavía no tiene este contenido. Puedes subirlo ahora mismo o explorar otros títulos.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-violet-900/40"
              >
                + Subir este contenido
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs sm:text-sm">
              Escribe el nombre de un anime o selecciona un género para comenzar a buscar...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
