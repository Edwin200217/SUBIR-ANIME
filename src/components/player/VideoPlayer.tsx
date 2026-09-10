import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FastForward,
  Maximize2,
  Minimize2,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  Volume2,
  VolumeX,
  X,
  Languages,
} from 'lucide-react';
import { Anime, Episode, SubtitleCue } from '../../types/anime';
import { saveWatchProgress } from '../../lib/storage';

interface VideoPlayerProps {
  anime: Anime;
  initialEpisodeNumber?: number;
  initialProgressSeconds?: number;
  onClose: () => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

const QUALITY_OPTIONS = ['Auto', '2160p (4K)', '1440p (2K)', '1080p (FHD)', '720p (HD)', '480p (SD)'];
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const AUDIO_TRACKS = [
  { id: 'latino', label: 'Español Latino (Doblaje Oficial)' },
  { id: 'japones', label: 'Japonés (Audio Original)' },
  { id: 'ingles', label: 'Inglés (Doblaje Internacional)' },
];

const SUBTITLE_TRACKS = [
  { id: 'latino_cc', label: 'Español Latino (Doblaje y CC)' },
  { id: 'es_sub', label: 'Español (Subtítulos Traducidos)' },
  { id: 'ja_romaji', label: 'Japonés (Romaji & Kanji)' },
  { id: 'en_sub', label: 'English (Full Subtitles)' },
  { id: 'off', label: 'Desactivado' },
];

// Helper to generate dynamic dialogue subtitles for anime scenes
function getDialogueCues(animeTitle: string, episodeTitle: string, track: string): SubtitleCue[] {
  if (track === 'off') return [];

  if (track === 'latino_cc' || track === 'es_sub') {
    return [
      { id: 'c1', startTime: 2, endTime: 6, character: 'Narrador', text: `En el universo de ${animeTitle}, una fuerza ancestral despierta entre las sombras.` },
      { id: 'c2', startTime: 7, endTime: 12, character: 'Ren (Shinobi)', text: '¡Prepárense todos! ¡No permitiré que destruyan nuestro clan!' },
      { id: 'c3', startTime: 13, endTime: 18, character: 'Aiko', text: '¡Ren, cuidado a tu izquierda! ¡Ese enemigo no es un guerrero común!' },
      { id: 'c4', startTime: 19, endTime: 24, character: 'Ren (Shinobi)', text: '¡Observa esto! ¡Estilo Secreto de las Sombras: Danza del Filamento Púrpura!' },
      { id: 'c5', startTime: 25, endTime: 31, character: 'Enemigo', text: '¡Maldición! ¿De dónde proviene semejante flujo de energía?' },
      { id: 'c6', startTime: 32, endTime: 37, character: 'Maestro Shinobi', text: 'Respira hondo, Ren. El verdadero poder no está en la espada, sino en el corazón.' },
      { id: 'c7', startTime: 38, endTime: 44, character: 'Ren (Shinobi)', text: '¡Lo entiendo, Maestro! ¡Lucharé por el futuro de Neo-Tokio!' },
      { id: 'c8', startTime: 45, endTime: 51, character: 'Aiko', text: '¡La barrera dimensional está respondiendo! ¡Podemos ganar esta batalla!' },
      { id: 'c9', startTime: 52, endTime: 58, character: 'Ren (Shinobi)', text: '¡Impacto Máximo! ¡Vórtice Kage... LIBERACIÓN!' },
      { id: 'c10', startTime: 59, endTime: 66, character: 'Efecto', text: '[Resonancia sónica masiva y choque de energía celestial]' },
      { id: 'c11', startTime: 67, endTime: 74, character: 'Aiko', text: 'Increíble... ¡lo lograste! El portal ha quedado asegurado.' },
      { id: 'c12', startTime: 75, endTime: 82, character: 'Ren (Shinobi)', text: `Este es solo el comienzo del episodio: ${episodeTitle}. ¡Sigamos adelante!` },
    ];
  }

  if (track === 'ja_romaji') {
    return [
      { id: 'j1', startTime: 2, endTime: 6, character: 'Narrator', text: 'Kodai no chikara ga, yami no naka kara mezameta.' },
      { id: 'j2', startTime: 7, endTime: 12, character: 'Ren', text: 'Minna, ki o tsukero! Kage no ichizoku o kesshite mamoru!' },
      { id: 'j3', startTime: 13, endTime: 18, character: 'Aiko', text: 'Ren, hidari da! Ano teki wa futsuu ja nai!' },
      { id: 'j4', startTime: 19, endTime: 24, character: 'Ren', text: 'Ougi! Kage no Mai: Murasaki no Sen!' },
      { id: 'j5', startTime: 25, endTime: 31, character: 'Enemy', text: 'Bakana! Kono kyouka na chakra wa doko kara...?!' },
      { id: 'j6', startTime: 32, endTime: 37, character: 'Master', text: 'Shin no chikara wa, kokoro no naka ni aru.' },
      { id: 'j7', startTime: 38, endTime: 44, character: 'Ren', text: 'Wakatta, Shishou! Mirai no tame ni tatakau!' },
      { id: 'j8', startTime: 45, endTime: 51, character: 'Aiko', text: 'Jigen no kabe ga kowarete yuku! Iku zo!' },
    ];
  }

  // English
  return [
    { id: 'e1', startTime: 2, endTime: 6, character: 'Narrator', text: `In the world of ${animeTitle}, an ancient power awakens from the shadows.` },
    { id: 'e2', startTime: 7, endTime: 12, character: 'Ren', text: 'Brace yourselves! I will never let our clan fall!' },
    { id: 'e3', startTime: 13, endTime: 18, character: 'Aiko', text: 'Ren, watch your flank! This is no ordinary foe!' },
    { id: 'e4', startTime: 19, endTime: 24, character: 'Ren', text: 'Witness our secret technique: Purple Shadow Dance!' },
    { id: 'e5', startTime: 25, endTime: 31, character: 'Enemy', text: 'Impossible! Where is this immense energy coming from?!' },
  ];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  initialEpisodeNumber = 1,
  initialProgressSeconds = 0,
  onClose,
  showToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active episode calculation
  const allEpisodes = anime.seasons?.flatMap((s) => s.episodes) || [];
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number>(initialEpisodeNumber);

  const currentEpisode: Episode | undefined =
    allEpisodes.find((e) => e.episodeNumber === currentEpisodeNumber) ||
    allEpisodes[0];

  const videoSource =
    currentEpisode?.videoUrl ||
    anime.videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('1080p (FHD)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  // Audio & Subtitle State (Defaults to Español Latino with Synchronized Subtitles)
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string>('latino');
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState<string>('latino_cc');
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null);
  const [subtitleSize, setSubtitleSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [subtitleColor, setSubtitleColor] = useState<'yellow' | 'white' | 'cyan'>('yellow');

  // Menus
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  // Resume prompt notification
  const [showResumePrompt, setShowResumePrompt] = useState(initialProgressSeconds > 5);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Mouse idle hide controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  };

  // Video Event Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
    showToast('info', `Velocidad: ${speed}x`);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowSettingsMenu(false);
    showToast('info', `Calidad de streaming: ${quality}`);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      showToast('warning', 'Picture-in-Picture no soportado en este navegador');
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.code === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        skipSeconds(10);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen]);

  // Track progress and update Watch History automatically + Sync subtitles
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Retrieve dialogue cues for current anime/episode
    const cues = getDialogueCues(
      anime.title,
      currentEpisode?.title || 'Episodio 1',
      activeSubtitleTrack
    );

    const onTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Check for active synchronized subtitle cue
      const loopTime = time % 85; // loops smoothly over duration if longer
      const foundCue = cues.find((c) => loopTime >= c.startTime && loopTime <= c.endTime);
      setCurrentCue(foundCue || null);

      // Auto-save watch history every 5 seconds
      if (Math.floor(time) % 5 === 0 && video.duration > 0) {
        const pct = Math.round((time / video.duration) * 100);
        saveWatchProgress({
          animeId: anime.id,
          episodeId: currentEpisode?.id || 'ep_main',
          seasonNumber: currentEpisode?.seasonNumber || 1,
          episodeNumber: currentEpisode?.episodeNumber || 1,
          animeTitle: anime.title,
          episodeTitle: currentEpisode?.title || anime.title,
          posterUrl: currentEpisode?.thumbnailUrl || anime.posterUrl,
          progressSeconds: Math.round(time),
          durationSeconds: Math.round(video.duration),
          progressPercentage: pct,
        });
      }
    };

    const onLoaded = () => {
      setDuration(video.duration);
      if (initialProgressSeconds > 0) {
        video.currentTime = initialProgressSeconds;
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
    };
  }, [anime, currentEpisode, initialProgressSeconds, activeSubtitleTrack]);

  // Resume watch prompt button
  const handleResume = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = initialProgressSeconds;
      videoRef.current.play().catch(() => {});
    }
    setShowResumePrompt(false);
  };

  // Next / Previous episode navigation
  const currentIndex = allEpisodes.findIndex((e) => e.episodeNumber === currentEpisodeNumber);
  const hasNextEpisode = currentIndex >= 0 && currentIndex < allEpisodes.length - 1;
  const hasPrevEpisode = currentIndex > 0;

  const goToNextEpisode = () => {
    if (hasNextEpisode) {
      const nextEp = allEpisodes[currentIndex + 1];
      setCurrentEpisodeNumber(nextEp.episodeNumber);
      setShowResumePrompt(false);
      showToast('info', `Reproduciendo ${nextEp.title}`);
    }
  };

  const goToPrevEpisode = () => {
    if (hasPrevEpisode) {
      const prevEp = allEpisodes[currentIndex - 1];
      setCurrentEpisodeNumber(prevEp.episodeNumber);
      setShowResumePrompt(false);
      showToast('info', `Reproduciendo ${prevEp.title}`);
    }
  };

  // Subtitle font color class
  const getSubtitleColorClass = () => {
    if (subtitleColor === 'white') return 'text-white';
    if (subtitleColor === 'cyan') return 'text-cyan-300';
    return 'text-yellow-300';
  };

  // Subtitle font size class
  const getSubtitleSizeClass = () => {
    if (subtitleSize === 'sm') return 'text-xs sm:text-sm';
    if (subtitleSize === 'lg') return 'text-base sm:text-2xl';
    return 'text-sm sm:text-lg';
  };

  return (
    <div
      ref={containerRef}
      id="kagestream-cinema-player"
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoSource}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-cyan-400 animate-spin" />
        </div>
      )}

      {/* Resume Notification Toast */}
      {showResumePrompt && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3 rounded-2xl glass-panel border border-cyan-400/40 shadow-2xl animate-fade-in text-xs sm:text-sm">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-white">Continuar desde {formatTime(initialProgressSeconds)}</span>
          <button
            id="btn-resume-watching"
            onClick={handleResume}
            className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md active:scale-95"
          >
            Reanudar
          </button>
          <button onClick={() => setShowResumePrompt(false)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* REAL-TIME SYNCHRONIZED DIALOGUE SUBTITLES OVERLAY */}
      {activeSubtitleTrack !== 'off' && currentCue && (
        <div className="absolute bottom-24 sm:bottom-28 inset-x-0 flex justify-center pointer-events-none px-6 z-20 animate-fade-in">
          <div className="flex flex-col items-center max-w-4xl">
            {/* Speaker Character Pill */}
            {currentCue.character && (
              <span className="mb-1.5 px-3 py-0.5 rounded-full bg-violet-950/90 border border-violet-500/40 text-cyan-300 font-bold text-[11px] sm:text-xs tracking-wider uppercase shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {currentCue.character}
              </span>
            )}
            {/* Subtitle Dialogue Box with High-Contrast Dropshadow */}
            <div
              className={`px-5 py-2 rounded-xl bg-black/85 backdrop-blur-md font-semibold text-center leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] border border-white/10 ${getSubtitleColorClass()} ${getSubtitleSizeClass()}`}
            >
              {currentCue.text}
            </div>
          </div>
        </div>
      )}

      {/* TOP OVERLAY BAR: Title, Active Audio Track Badge & Close */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 text-white">
          <button
            id="btn-player-back"
            onClick={onClose}
            className="p-2 rounded-full glass-panel hover:bg-white/20 text-slate-200 hover:text-white transition-all"
            title="Volver atrás (Esc)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-display font-bold line-clamp-1">
                {anime.title}
              </h2>
              {/* Latino Badge */}
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                DOBLAJE LATINO
              </span>
              <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-400/30 text-[10px] font-bold">
                SUB CC
              </span>
            </div>
            {currentEpisode && (
              <p className="text-xs text-violet-300 font-medium line-clamp-1 mt-0.5">
                Temporada {currentEpisode.seasonNumber} • Episodio {currentEpisode.episodeNumber}: {currentEpisode.title}
              </p>
            )}
          </div>
        </div>

        <button
          id="btn-player-close"
          onClick={onClose}
          className="p-2 rounded-full glass-panel hover:bg-white/20 text-slate-200 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* BOTTOM CONTROLS BAR */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-30 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubbable Timeline */}
        <div className="relative flex items-center group">
          <input
            id="player-timeline-slider"
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:h-2.5 transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls: Play/Pause, Replay/Forward 10s, Volume, Timestamp */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              id="btn-player-toggle-play"
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-transform active:scale-90"
              title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              id="btn-player-rewind-10"
              onClick={() => skipSeconds(-10)}
              className="p-2 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              title="Retroceder 10 segundos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="btn-player-forward-10"
              onClick={() => skipSeconds(10)}
              className="p-2 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              title="Adelantar 10 segundos"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Episode Stepper */}
            {allEpisodes.length > 1 && (
              <div className="flex items-center gap-1 border-l border-white/15 pl-2 sm:pl-3">
                <button
                  onClick={goToPrevEpisode}
                  disabled={!hasPrevEpisode}
                  className={`p-2 rounded-full hover:bg-white/20 transition-all ${
                    hasPrevEpisode ? 'text-slate-300 hover:text-white' : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Episodio anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextEpisode}
                  disabled={!hasNextEpisode}
                  className={`p-2 rounded-full hover:bg-white/20 transition-all ${
                    hasNextEpisode ? 'text-slate-300 hover:text-white' : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Siguiente episodio"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                id="btn-player-mute"
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/20 text-slate-300 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-white/20 accent-violet-400 cursor-pointer hidden sm:inline-block"
              />
            </div>

            {/* Timestamp */}
            <div className="text-xs text-slate-300 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Audio Tracks, Subtitles, Settings, PiP, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Audio Track Selector */}
            <div className="relative">
              <button
                id="btn-player-audio-track"
                onClick={() => {
                  setShowAudioMenu(!showAudioMenu);
                  setShowSubtitleMenu(false);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass-panel hover:bg-white/20 text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-all"
                title="Pistas de Audio (Español Latino, Japonés)"
              >
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Audio Latino</span>
              </button>

              {showAudioMenu && (
                <div className="absolute bottom-12 right-0 w-60 rounded-xl glass-panel border border-cyan-500/30 p-2.5 shadow-2xl text-xs z-40 space-y-1">
                  <div className="px-2 py-1 text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    Pistas de Audio Disponibles
                  </div>
                  {AUDIO_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setSelectedAudioTrack(track.id);
                        setShowAudioMenu(false);
                        showToast('success', `Audio cambiado: ${track.label}`);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left ${
                        selectedAudioTrack === track.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{track.label}</span>
                      {selectedAudioTrack === track.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitles Menu with Size & Color controls */}
            <div className="relative">
              <button
                id="btn-player-subtitles"
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowAudioMenu(false);
                  setShowSettingsMenu(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass-panel hover:bg-white/20 transition-all text-xs font-semibold ${
                  activeSubtitleTrack !== 'off'
                    ? 'text-yellow-300 border border-yellow-500/30 bg-yellow-500/10'
                    : 'text-slate-400 border border-white/10'
                }`}
                title="Subtítulos sincronizados cuando hablan"
              >
                <Subtitles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden sm:inline">Subtítulos CC</span>
              </button>

              {showSubtitleMenu && (
                <div className="absolute bottom-12 right-0 w-64 rounded-xl glass-panel border border-yellow-500/30 p-3 shadow-2xl text-xs z-40 space-y-2.5">
                  <div>
                    <div className="px-2 py-1 text-[10px] text-yellow-400 uppercase font-bold tracking-wider">
                      Subtítulos Sincronizados
                    </div>
                    <div className="space-y-1 mt-1">
                      {SUBTITLE_TRACKS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveSubtitleTrack(t.id);
                            showToast('info', `Subtítulos: ${t.label}`);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs ${
                            activeSubtitleTrack === t.id
                              ? 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{t.label}</span>
                          {activeSubtitleTrack === t.id && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeSubtitleTrack !== 'off' && (
                    <>
                      {/* Subtitle Size */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-bold">
                          Tamaño de subtítulo
                        </div>
                        <div className="flex gap-1.5 mt-1">
                          {(['sm', 'md', 'lg'] as const).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setSubtitleSize(sz)}
                              className={`flex-1 py-1 rounded text-center text-xs font-medium uppercase ${
                                subtitleSize === sz
                                  ? 'bg-yellow-500 text-black font-bold'
                                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              {sz === 'sm' ? 'Chico' : sz === 'md' ? 'Medio' : 'Grande'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Subtitle Color */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-bold">
                          Color de texto
                        </div>
                        <div className="flex gap-2 mt-1 px-2">
                          <button
                            onClick={() => setSubtitleColor('yellow')}
                            className={`w-6 h-6 rounded-full bg-yellow-400 border-2 ${
                              subtitleColor === 'yellow' ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            title="Amarillo Anime"
                          />
                          <button
                            onClick={() => setSubtitleColor('white')}
                            className={`w-6 h-6 rounded-full bg-white border-2 ${
                              subtitleColor === 'white' ? 'border-cyan-400 scale-110' : 'border-transparent'
                            }`}
                            title="Blanco Nítido"
                          />
                          <button
                            onClick={() => setSubtitleColor('cyan')}
                            className={`w-6 h-6 rounded-full bg-cyan-400 border-2 ${
                              subtitleColor === 'cyan' ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            title="Cyan Neón"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quality & Speed Settings Menu */}
            <div className="relative">
              <button
                id="btn-player-settings"
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowSubtitleMenu(false);
                  setShowAudioMenu(false);
                }}
                className="p-2 rounded-full hover:bg-white/20 text-slate-300 hover:text-white"
                title="Configuración de reproducción"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-12 right-0 w-52 rounded-xl glass-panel border border-white/15 p-2.5 shadow-2xl text-xs z-40 space-y-2">
                  <div>
                    <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-semibold">
                      Resolución / Calidad
                    </div>
                    <div className="space-y-0.5">
                      {QUALITY_OPTIONS.slice(0, 5).map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQualityChange(q)}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-left ${
                            selectedQuality === q
                              ? 'bg-violet-600/30 text-cyan-300 font-bold'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{q}</span>
                          {selectedQuality === q && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-semibold">
                      Velocidad
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {SPEED_OPTIONS.map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-1 rounded text-[11px] font-mono ${
                            playbackSpeed === spd
                              ? 'bg-violet-600 text-white font-bold'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              id="btn-player-pip"
              onClick={togglePiP}
              className="p-2 rounded-full hover:bg-white/20 text-slate-300 hover:text-white hidden sm:inline-block"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              id="btn-player-fullscreen"
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/20 text-slate-300 hover:text-white"
              title="Pantalla completa (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
