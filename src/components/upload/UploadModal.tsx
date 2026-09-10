import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Film,
  FolderUp,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Plus,
  Sparkles,
  Tv,
  Upload,
  Video,
  X,
} from 'lucide-react';
import {
  AgeRating,
  Anime,
  AnimeStatus,
  ContentType,
  Episode,
  Season,
  SeasonPeriod,
  VideoMetadata,
} from '../../types/anime';
import { storeMediaBlob } from '../../lib/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAnime: (anime: Anime) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

const AVAILABLE_GENRES = [
  'Acción',
  'Aventura',
  'Comedia',
  'Drama',
  'Fantasía',
  'Romance',
  'Ciencia ficción',
  'Shonen',
  'Seinen',
  'Isekai',
  'Sobrenatural',
  'Misterio',
  'Mecha',
  'Deportes',
  'Psicológico',
  'Slice of Life',
];

const AUDIO_OPTIONS = ['Japonés', 'Español (Latinoamérica)', 'Español (España)', 'Inglés', 'Coreano'];
const SUBTITLE_OPTIONS = ['Español', 'Inglés', 'Japonés', 'Francés', 'Portugués', 'Alemán', 'Italiano'];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSaveAnime,
  showToast,
}) => {
  if (!isOpen) return null;

  // Active step: 'form' | 'uploading' | 'completed'
  const [step, setStep] = useState<'form' | 'uploading' | 'completed'>('form');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('Preparando...');

  // Form State
  const [title, setTitle] = useState('');
  const [altTitle, setAltTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [seasonPeriod, setSeasonPeriod] = useState<SeasonPeriod>('Primavera');
  const [type, setType] = useState<ContentType>('Serie');
  const [status, setStatus] = useState<AnimeStatus>('En emisión');
  const [rating, setRating] = useState<AgeRating>('16+');
  const [quality, setQuality] = useState('1080P');

  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Acción', 'Fantasía']);
  const [audioLanguages, setAudioLanguages] = useState<string[]>(['Japonés', 'Español (Latinoamérica)']);
  const [subtitlesLanguages, setSubtitlesLanguages] = useState<string[]>(['Español', 'Inglés']);

  // Media files & URLs
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);

  // Drag states
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingMultiEpisodes, setIsDraggingMultiEpisodes] = useState(false);

  // Multi-episodes list
  const [bulkEpisodes, setBulkEpisodes] = useState<Array<{
    number: number;
    title: string;
    duration: number;
    durationFormatted: string;
    videoUrl: string;
    fileName?: string;
  }>>([]);

  // File input refs
  const posterInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const bulkEpisodesInputRef = useRef<HTMLInputElement>(null);

  // Genre toggler
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Process video file to extract metadata
  const processVideoFile = (file: File) => {
    setUploadedVideoFile(file);
    const fakeMetadata: VideoMetadata = {
      sizeBytes: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      format: file.type || 'video/mp4',
      resolution: file.size > 50000000 ? '1080p' : '720p',
      fps: 24,
      duration: 1440,
      codec: 'H.264 / AAC',
      bitrateKbps: 4500,
    };
    setVideoMetadata(fakeMetadata);

    // Try HTML5 video element to read actual duration
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = URL.createObjectURL(file);
    tempVideo.onloadedmetadata = () => {
      setVideoMetadata((prev) => ({
        ...prev,
        duration: Math.round(tempVideo.duration) || 1440,
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
        resolution:
          tempVideo.videoHeight >= 2160
            ? '4K'
            : tempVideo.videoHeight >= 1080
            ? '1080p'
            : '720p',
      }));
    };
  };

  // Bulk episodes batch dropper
  const handleBulkEpisodes = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newEps = Array.from(files).map((file, idx) => {
      const epNum = bulkEpisodes.length + idx + 1;
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/episode|episodio|ep/gi, '')
        .trim();

      const blobUrl = URL.createObjectURL(file);
      return {
        number: epNum,
        title: cleanName || `Episodio ${String(epNum).padStart(2, '0')}`,
        duration: 1440,
        durationFormatted: '24:00',
        videoUrl: blobUrl,
        fileName: file.name,
      };
    });

    setBulkEpisodes([...bulkEpisodes, ...newEps]);
    showToast('info', `${files.length} episodios preparados`, 'Se organizaron en la lista de episodios.');
  };

  // Submit Handler with 6-stage animated progress
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Campo requerido', 'Por favor introduce un título para el contenido.');
      return;
    }

    // Default covers if user didn't upload
    const finalPoster =
      posterUrl ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
    const finalBanner =
      bannerUrl ||
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80';

    setStep('uploading');
    setUploadProgress(10);
    setUploadStatusText('Preparando...');

    // Simulate multi-stage upload progress
    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(28);
    setUploadStatusText('Subiendo archivos de vídeo e imágenes...');

    let resolvedVideoUrl = videoUrl;
    if (uploadedVideoFile) {
      try {
        const storedUrl = await storeMediaBlob(
          `video_${Date.now()}_${uploadedVideoFile.name}`,
          uploadedVideoFile
        );
        resolvedVideoUrl = storedUrl;
      } catch {
        resolvedVideoUrl = URL.createObjectURL(uploadedVideoFile);
      }
    }

    await new Promise((r) => setTimeout(r, 500));
    setUploadProgress(55);
    setUploadStatusText('Procesando códecs y pistas de subtítulos...');

    await new Promise((r) => setTimeout(r, 450));
    setUploadProgress(75);
    setUploadStatusText('Generando miniaturas en alta resolución...');

    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(92);
    setUploadStatusText('Publicando en la biblioteca...');

    // Construct Seasons & Episodes structure
    const animeId = `anime_${Date.now()}`;
    const generatedEpisodes: Episode[] =
      bulkEpisodes.length > 0
        ? bulkEpisodes.map((b) => ({
            id: `ep_${animeId}_${b.number}`,
            animeId,
            seasonNumber: 1,
            episodeNumber: b.number,
            title: b.title,
            description: `Episodio ${b.number} de ${title}`,
            videoUrl: b.videoUrl || resolvedVideoUrl,
            thumbnailUrl: finalPoster,
            duration: b.duration,
            durationFormatted: b.durationFormatted,
            quality,
            subtitles: subtitlesLanguages.map((lang, idx) => ({
              id: `sub_${idx}`,
              language: lang,
              label: lang,
            })),
            createdAt: new Date().toISOString(),
          }))
        : type === 'Serie'
        ? [
            {
              id: `ep_${animeId}_1`,
              animeId,
              seasonNumber: 1,
              episodeNumber: 1,
              title: 'Episodio 01: El Comienzo',
              description: description || 'Primer episodio',
              videoUrl: resolvedVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnailUrl: finalPoster,
              duration: videoMetadata?.duration || 1440,
              durationFormatted: '24:00',
              quality,
              subtitles: subtitlesLanguages.map((lang, idx) => ({
                id: `sub_${idx}`,
                language: lang,
                label: lang,
              })),
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    const seasons: Season[] =
      type === 'Serie'
        ? [
            {
              id: `season_${animeId}_1`,
              seasonNumber: 1,
              title: 'Temporada 1',
              episodes: generatedEpisodes,
            },
          ]
        : [];

    const newAnime: Anime = {
      id: animeId,
      title,
      altTitle,
      description: description || 'Sin descripción detallada proporcionada.',
      year,
      seasonPeriod,
      genres: selectedGenres.length > 0 ? selectedGenres : ['Acción'],
      type,
      status,
      rating,
      audioLanguages,
      subtitlesLanguages,
      posterUrl: finalPoster,
      bannerUrl: finalBanner,
      videoUrl: resolvedVideoUrl,
      seasons,
      isPublished: true,
      isFeatured: false,
      views: 0,
      quality,
      isUploadedByUser: true,
      createdAt: new Date().toISOString(),
      videoMetadata: videoMetadata || undefined,
    };

    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(100);
    setUploadStatusText('¡Completado con éxito!');

    onSaveAnime(newAnime);
    showToast('success', '¡Contenido publicado!', `"${title}" ya está disponible en tu biblioteca.`);
    setStep('completed');
  };

  return (
    <div
      id="upload-content-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl my-auto bg-[#0b0e18] border border-violet-500/30 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
                <span>Subir Contenido</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 font-mono">
                  PRO STUDIO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Añade animes, películas, series y gestiona temporadas
              </p>
            </div>
          </div>

          <button
            id="btn-close-upload-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-6">
          {/* PROGRESS / UPLOAD OVERLAY */}
          {step === 'uploading' && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"
                  style={{ animationDuration: '1.2s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-2xl text-cyan-300">
                  {uploadProgress}%
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-white mb-2">
                {uploadStatusText}
              </h3>
              <p className="text-sm text-slate-400 max-w-md">
                Procesando códecs, analizando resolución y preparando miniaturas para streaming...
              </p>

              <div className="w-full max-w-md bg-white/10 h-2.5 rounded-full mt-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* COMPLETED SCREEN */}
          {step === 'completed' && (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                ¡Contenido Publicado con Éxito!
              </h3>
              <p className="text-slate-300 text-sm max-w-md mb-8">
                El anime ha sido indexado y está disponible para reproducir en tu universo KAGESTREAM.
              </p>
              <div className="flex items-center gap-3">
                <button
                  id="btn-upload-another"
                  onClick={() => {
                    setTitle('');
                    setDescription('');
                    setBulkEpisodes([]);
                    setStep('form');
                  }}
                  className="px-5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-sm font-semibold"
                >
                  Subir otro título
                </button>
                <button
                  id="btn-upload-finish-close"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-900/50"
                >
                  Ver en la biblioteca
                </button>
              </div>
            </div>
          )}

          {/* FORM VIEW */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Tipo de Contenido
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['Serie', 'Película', 'OVA', 'Especial', 'Cortometraje'] as ContentType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                        type === t
                          ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Alt Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Título Principal *
                  </label>
                  <input
                    id="input-anime-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Kage no Shinobi, Jujutsu..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Título Alternativo / Romaji
                  </label>
                  <input
                    id="input-anime-alt-title"
                    type="text"
                    value={altTitle}
                    onChange={(e) => setAltTitle(e.target.value)}
                    placeholder="Ej. Shadow Ninja: Chronicles"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Sinopsis / Descripción
                </label>
                <textarea
                  id="input-anime-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escribe la historia o argumento principal..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Year, Season, Status, Rating, Quality */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Año
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={1970}
                    max={2030}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Temporada
                  </label>
                  <select
                    value={seasonPeriod}
                    onChange={(e) => setSeasonPeriod(e.target.value as SeasonPeriod)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="Primavera">Primavera</option>
                    <option value="Verano">Verano</option>
                    <option value="Otoño">Otoño</option>
                    <option value="Invierno">Invierno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AnimeStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="En emisión">En emisión</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Próximamente">Próximamente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Edad
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as AgeRating)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="Todo público">Todo público</option>
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Calidad
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-violet-500 font-mono"
                  >
                    <option value="4K">4K UHD</option>
                    <option value="1080P">1080P FHD</option>
                    <option value="720P">720P HD</option>
                  </select>
                </div>
              </div>

              {/* Genres Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Géneros (Selecciona los aplicables)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white font-semibold shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Posters & Banner Drag-and-Drop Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Poster Drop Zone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Portada (3:4)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPoster(true);
                    }}
                    onDragLeave={() => setIsDraggingPoster(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPoster(false);
                      const file = e.dataTransfer.files[0];
                      if (file) setPosterUrl(URL.createObjectURL(file));
                    }}
                    onClick={() => posterInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[140px] ${
                      isDraggingPoster
                        ? 'border-violet-400 bg-violet-950/40 scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                        : 'border-white/15 hover:border-violet-500/50 bg-black/30'
                    }`}
                  >
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPosterUrl(URL.createObjectURL(file));
                      }}
                    />
                    {posterUrl ? (
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden border border-white/20">
                        <img src={posterUrl} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 px-1 rounded text-cyan-300">
                          Listo
                        </span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-7 h-7 text-violet-400 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-200">
                          Arrastra tu portada aquí
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">o haz clic para explorar</p>
                      </>
                    )}
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="O pega URL de imagen..."
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Banner Drop Zone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Banner Panorámico (16:9)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(true);
                    }}
                    onDragLeave={() => setIsDraggingBanner(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(false);
                      const file = e.dataTransfer.files[0];
                      if (file) setBannerUrl(URL.createObjectURL(file));
                    }}
                    onClick={() => bannerInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[140px] ${
                      isDraggingBanner
                        ? 'border-cyan-400 bg-cyan-950/40 scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                        : 'border-white/15 hover:border-cyan-500/50 bg-black/30'
                    }`}
                  >
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setBannerUrl(URL.createObjectURL(file));
                      }}
                    />
                    {bannerUrl ? (
                      <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-white/20">
                        <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 px-1 rounded text-cyan-300">
                          Listo
                        </span>
                      </div>
                    ) : (
                      <>
                        <Layers className="w-7 h-7 text-cyan-400 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-200">
                          Arrastra tu banner aquí
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">o haz clic para explorar</p>
                      </>
                    )}
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="O pega URL de banner..."
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Video File Upload & Metadata Analyzer */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Archivo de Video Principal (MP4, WebM, MKV, HLS M3U8)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(true);
                  }}
                  onDragLeave={() => setIsDraggingVideo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(false);
                    const file = e.dataTransfer.files[0];
                    if (file) processVideoFile(file);
                  }}
                  onClick={() => videoInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                    isDraggingVideo
                      ? 'border-violet-400 bg-violet-950/40 shadow-[0_0_25px_rgba(139,92,246,0.4)]'
                      : 'border-white/15 hover:border-violet-500/40 bg-black/30'
                  }`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processVideoFile(file);
                    }}
                  />
                  <Video className="w-8 h-8 text-violet-400 mb-2" />
                  {uploadedVideoFile ? (
                    <div className="text-center">
                      <p className="text-sm font-bold text-white mb-1">
                        {uploadedVideoFile.name}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-cyan-300">
                        <span className="px-2 py-0.5 rounded bg-white/10">
                          {videoMetadata?.resolution || '1080p'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10">
                          {videoMetadata?.sizeFormatted}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10">
                          {videoMetadata?.codec}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-200">
                        Arrastra y suelta tu archivo de vídeo aquí
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Compatible con MP4, WebM, HLS M3U8 o MKV
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="O introduce URL de transmisión HLS (m3u8) o MP4 autorizado..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Bulk Episodes Batch Upload Area (For Series) */}
              {type === 'Serie' && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Subida de Episodios Múltiple (Simultánea)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Arrastra 20, 50 o más episodios de una sola vez
                      </p>
                    </div>
                    {bulkEpisodes.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                        {bulkEpisodes.length} episodios preparados
                      </span>
                    )}
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingMultiEpisodes(true);
                    }}
                    onDragLeave={() => setIsDraggingMultiEpisodes(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingMultiEpisodes(false);
                      handleBulkEpisodes(e.dataTransfer.files);
                    }}
                    onClick={() => bulkEpisodesInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDraggingMultiEpisodes
                        ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                        : 'border-white/15 hover:border-cyan-500/40 bg-black/20'
                    }`}
                  >
                    <input
                      ref={bulkEpisodesInputRef}
                      type="file"
                      multiple
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleBulkEpisodes(e.target.files)}
                    />
                    <FolderUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-200">
                      Arrastrar 20, 50 o más episodios aquí
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      KAGESTREAM ordenará y numerará automáticamente cada episodio
                    </p>
                  </div>

                  {bulkEpisodes.length > 0 && (
                    <div className="mt-3 max-h-36 overflow-y-auto space-y-1.5 pr-2">
                      {bulkEpisodes.map((ep, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-violet-600/40 text-violet-300 flex items-center justify-center font-mono font-bold">
                              {ep.number}
                            </span>
                            <span className="font-medium text-white">{ep.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBulkEpisodes(bulkEpisodes.filter((_, idx) => idx !== i))
                            }
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-anime-upload"
                  type="submit"
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-bold shadow-lg shadow-violet-900/50 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publicar Contenido</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
