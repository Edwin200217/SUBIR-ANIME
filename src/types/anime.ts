export type ContentType = 'Serie' | 'Película' | 'OVA' | 'Especial' | 'Cortometraje';

export type AnimeStatus = 'En emisión' | 'Finalizado' | 'Próximamente';

export type AgeRating = 'Todo público' | '13+' | '16+' | '18+';

export type SeasonPeriod = 'Invierno' | 'Primavera' | 'Verano' | 'Otoño';

export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  character?: string; // e.g. "Tanjiro", "Naruto", "Satoru Gojo", "Narrador"
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url?: string;
  content?: string; // VTT or SRT raw content
  cues?: SubtitleCue[];
}

export interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  resolution?: string; // 1080p, 4K, 720p
  codec?: string;
  sizeBytes?: number;
  sizeFormatted?: string;
  bitrateKbps?: number;
  fps?: number;
  format?: string;
}

export interface Episode {
  id: string;
  animeId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl: string; // File URL or object URL or streaming link
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string; // "24:15"
  quality: string; // '4K' | '1080p' | '720p'
  subtitles: SubtitleTrack[];
  views?: number;
  createdAt: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface Anime {
  id: string;
  title: string;
  altTitle?: string;
  description: string;
  year: number;
  seasonPeriod?: SeasonPeriod;
  genres: string[];
  type: ContentType;
  status: AnimeStatus;
  rating: AgeRating;
  audioLanguages: string[];
  subtitlesLanguages: string[];
  posterUrl: string;
  bannerUrl: string;
  videoUrl?: string; // For movies or standalone video items
  seasons: Season[];
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  quality: string; // '4K' | '1080P' | '720P'
  createdAt: string;
  updatedAt?: string;
  isDemo?: boolean;
  isUploadedByUser?: boolean;
  uploaderId?: string;
  videoMetadata?: VideoMetadata;
}

export interface WatchHistoryItem {
  id: string;
  animeId: string;
  episodeId: string;
  seasonNumber: number;
  episodeNumber: number;
  animeTitle: string;
  episodeTitle: string;
  posterUrl: string;
  progressSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  lastWatched: string;
}

export interface UserPreferences {
  defaultQuality: string;
  autoPlayNext: boolean;
  defaultSubtitles: string;
  animatedBackground: boolean;
  backgroundScene: 'all_animes' | 'epic_battle' | 'cyberpunk' | 'sakura_forest' | 'ninja_shrine' | 'futuristic' | 'snow_mountain' | 'starry_sky';
  introAnimation: 'always' | 'once' | 'off';
  reduceMotion: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  preferences: UserPreferences;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAnimeId?: string;
  buttonText: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'auth' | 'settings';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
