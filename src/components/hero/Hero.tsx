import React from 'react';
import {
  Check,
  Compass,
  Film,
  Info,
  Play,
  Plus,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Anime, Banner } from '../../types/anime';

interface HeroProps {
  animes: Anime[];
  banners?: Banner[];
  onOpenUpload: () => void;
  onExploreLibrary: () => void;
  onPlayAnime: (anime: Anime, episodeNumber?: number) => void;
  onViewDetails: (anime: Anime) => void;
  onToggleMyList: (animeId: string) => void;
  inMyList: (animeId: string) => boolean;
  onLoadDemoContent: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  animes,
  banners = [],
  onOpenUpload,
  onExploreLibrary,
  onPlayAnime,
  onViewDetails,
  onToggleMyList,
  inMyList,
  onLoadDemoContent,
}) => {
  // Check if there is real content
  const hasContent = animes.length > 0;

  // Pick featured anime or first anime
  const featuredAnime = animes.find((a) => a.isFeatured && a.isPublished) || animes.find((a) => a.isPublished);

  // CASE 1: EMPTY INITIAL STATE
  if (!hasContent || !featuredAnime) {
    return (
      <section
        id="hero-empty-state"
        className="relative min-h-[52vh] flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center"
      >
        <div className="absolute w-[420px] h-[280px] rounded-full bg-gradient-to-tr from-violet-600/15 via-red-500/10 to-transparent blur-3xl -z-10" />

        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-[11px] font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>KAGESTREAM • PLATAFORMA LISTA</span>
          </div>

          <h1
            id="hero-title-empty"
            className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight mb-4"
          >
            TU UNIVERSO ANIME <br />
            <span className="text-anime-gradient drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              COMIENZA AQUÍ
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed max-w-lg mb-6">
            Tu biblioteca está vacía. Sube tu primer anime, película o serie y comienza a construir tu catálogo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-hero-upload-anime"
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-950/50 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-cyan-200" />
              <span>SUBIR ANIME</span>
            </button>

            <button
              id="btn-hero-explore-library"
              onClick={onExploreLibrary}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all"
            >
              <Compass className="w-4 h-4 text-violet-400" />
              <span>EXPLORAR BIBLIOTECA</span>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5">
            <button
              id="btn-load-demo-content"
              onClick={onLoadDemoContent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-violet-500/30 text-[11px] font-semibold text-violet-300 hover:text-white transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Cargar contenido de demostración (DEMO)</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // CASE 2: ACTIVE HERO WITH FEATURED CONTENT (Compact layout)
  const isInList = inMyList(featuredAnime.id);

  return (
    <section
      id="hero-featured-anime"
      className="relative min-h-[48vh] sm:min-h-[56vh] max-h-[580px] flex items-end pb-8 sm:pb-12 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Banner Image with Vignette Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={featuredAnime.bannerUrl || featuredAnime.posterUrl}
          alt={featuredAnime.title}
          className="w-full h-full object-cover object-center transform scale-102 filter brightness-75 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-3xl mx-auto lg:mx-0 lg:ml-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="px-2.5 py-0.5 rounded bg-violet-600/90 border border-violet-400/50 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            DESTACADO
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
            {featuredAnime.quality || '4K'}
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-slate-200 text-[10px] font-semibold">
            {featuredAnime.type}
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-amber-500/40 text-amber-300 text-[10px] font-bold">
            ★ {featuredAnime.rating}
          </span>
          <span className="text-[11px] text-slate-300 font-medium ml-1">
            {featuredAnime.year} • {featuredAnime.status}
          </span>
          {featuredAnime.isUploadedByUser && (
            <span className="px-2 py-0.5 rounded bg-indigo-600/90 text-white text-[10px] font-bold uppercase">
              Subido por mí
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          id="hero-featured-title"
          className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          <span className="hover:text-cyan-300 transition-colors">{featuredAnime.title}</span>
        </h1>

        {featuredAnime.altTitle && (
          <p className="text-xs sm:text-sm text-violet-300/90 font-medium mb-2">
            {featuredAnime.altTitle}
          </p>
        )}

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-200/90 line-clamp-2 sm:line-clamp-3 max-w-xl mb-3 font-normal leading-relaxed drop-shadow">
          {featuredAnime.description}
        </p>

        {/* Genre Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {featuredAnime.genres?.map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] font-medium border border-white/10"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-hero-play-featured"
            onClick={() => onPlayAnime(featuredAnime, 1)}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>REPRODUCIR</span>
          </button>

          <button
            id="btn-hero-toggle-list"
            onClick={() => onToggleMyList(featuredAnime.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all border ${
              isInList
                ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                : 'glass-panel hover:bg-white/10 text-white border-white/20'
            }`}
          >
            {isInList ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>EN MI LISTA</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                <span>MI LISTA</span>
              </>
            )}
          </button>

          <button
            id="btn-hero-more-info"
            onClick={() => onViewDetails(featuredAnime)}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl glass-panel hover:bg-white/15 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all"
          >
            <Info className="w-3.5 h-3.5 text-slate-300" />
            <span>DETALLES</span>
          </button>
        </div>
      </div>
    </section>
  );
};
