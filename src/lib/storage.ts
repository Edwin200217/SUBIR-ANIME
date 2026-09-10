import {
  Anime,
  AuditLog,
  Banner,
  Episode,
  Season,
  UserProfile,
  WatchHistoryItem,
} from '../types/anime';

const STORAGE_KEYS = {
  ANIMES: 'kagestream_animes_v1',
  WATCH_HISTORY: 'kagestream_watch_history_v1',
  MY_LIST: 'kagestream_my_list_v1',
  FAVORITES: 'kagestream_favorites_v1',
  COMPLETED: 'kagestream_completed_v1',
  BANNERS: 'kagestream_banners_v1',
  USERS: 'kagestream_users_v1',
  CURRENT_USER: 'kagestream_current_user_v1',
  AUDIT_LOGS: 'kagestream_audit_logs_v1',
  SETTINGS: 'kagestream_settings_v1',
};

// Default current user with ADMIN access for seamless immediate management
export const DEFAULT_USER: UserProfile = {
  id: 'usr_admin_master',
  name: 'Kage Admin',
  email: 'admin@kagestream.net',
  avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  role: 'ADMIN',
  preferences: {
    defaultQuality: '1080p',
    autoPlayNext: true,
    defaultSubtitles: 'Español Latino (Doblaje y CC)',
    animatedBackground: true,
    backgroundScene: 'all_animes',
    introAnimation: 'always',
    reduceMotion: false,
  },
};

// IndexedDB Helper for video/image blobs storage if uploaded by user
const DB_NAME = 'kagestream_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeMediaBlob(key: string, blob: Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve(URL.createObjectURL(blob));
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not store in IndexedDB, fallback to memory URL:', err);
    return URL.createObjectURL(blob);
  }
}

export async function getMediaBlobUrl(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result instanceof Blob) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

// Storage Operations
export function getStoredAnimes(): Anime[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANIMES);
    if (!raw) {
      return loadDemoContent();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return loadDemoContent();
    }
    return parsed;
  } catch {
    return loadDemoContent();
  }
}

export function saveAnime(anime: Anime): void {
  const current = getStoredAnimes();
  const index = current.findIndex((item) => item.id === anime.id);
  let updated: Anime[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...anime, updatedAt: new Date().toISOString() };
  } else {
    updated = [anime, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.ANIMES, JSON.stringify(updated));
  logAction(
    index >= 0 ? 'update' : 'create',
    `${index >= 0 ? 'Actualizado' : 'Publicado'} anime: ${anime.title}`,
    `Tipo: ${anime.type}, Géneros: ${anime.genres.join(', ')}`
  );
}

export function deleteAnime(animeId: string): void {
  const current = getStoredAnimes();
  const target = current.find((a) => a.id === animeId);
  const filtered = current.filter((item) => item.id !== animeId);
  localStorage.setItem(STORAGE_KEYS.ANIMES, JSON.stringify(filtered));
  if (target) {
    logAction('delete', `Eliminado: ${target.title}`, `ID: ${animeId}`);
  }
}

export function toggleAnimePublish(animeId: string): boolean {
  const current = getStoredAnimes();
  const target = current.find((a) => a.id === animeId);
  if (!target) return false;
  target.isPublished = !target.isPublished;
  target.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.ANIMES, JSON.stringify(current));
  logAction(
    'update',
    `${target.isPublished ? 'Publicado' : 'Ocultado'}: ${target.title}`,
    `Estado ahora: ${target.isPublished ? 'Visible' : 'Oculto'}`
  );
  return target.isPublished;
}

export function duplicateAnime(animeId: string): Anime | null {
  const current = getStoredAnimes();
  const original = current.find((a) => a.id === animeId);
  if (!original) return null;
  const copy: Anime = {
    ...original,
    id: `anime_${Date.now()}_copy`,
    title: `${original.title} (Copia)`,
    views: 0,
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveAnime(copy);
  return copy;
}

export function incrementAnimeViews(animeId: string): void {
  const current = getStoredAnimes();
  const target = current.find((a) => a.id === animeId);
  if (target) {
    target.views = (target.views || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.ANIMES, JSON.stringify(current));
  }
}

// User lists
export function getUserList(key: 'myList' | 'favorites' | 'completed'): string[] {
  try {
    const storageKey =
      key === 'myList'
        ? STORAGE_KEYS.MY_LIST
        : key === 'favorites'
        ? STORAGE_KEYS.FAVORITES
        : STORAGE_KEYS.COMPLETED;
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleUserListItem(
  key: 'myList' | 'favorites' | 'completed',
  animeId: string
): boolean {
  const list = getUserList(key);
  const exists = list.includes(animeId);
  let updated: string[];
  if (exists) {
    updated = list.filter((id) => id !== animeId);
  } else {
    updated = [...list, animeId];
  }
  const storageKey =
    key === 'myList'
      ? STORAGE_KEYS.MY_LIST
      : key === 'favorites'
      ? STORAGE_KEYS.FAVORITES
      : STORAGE_KEYS.COMPLETED;
  localStorage.setItem(storageKey, JSON.stringify(updated));
  return !exists;
}

// Watch History
export function getWatchHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchProgress(item: Omit<WatchHistoryItem, 'id' | 'lastWatched'>): void {
  const current = getWatchHistory();
  const existingIdx = current.findIndex(
    (h) => h.animeId === item.animeId && h.episodeId === item.episodeId
  );
  const updatedItem: WatchHistoryItem = {
    ...item,
    id: `${item.animeId}_${item.episodeId}`,
    lastWatched: new Date().toISOString(),
  };

  let newHistory: WatchHistoryItem[];
  if (existingIdx >= 0) {
    newHistory = [...current];
    newHistory[existingIdx] = updatedItem;
  } else {
    newHistory = [updatedItem, ...current];
  }
  // Keep max 50 items
  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(newHistory.slice(0, 50)));
}

export function removeWatchHistoryItem(id: string): void {
  const current = getWatchHistory();
  const filtered = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(filtered));
}

export function clearWatchHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
}

// User Profile & Preferences
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_USER,
          ...parsed,
          preferences: {
            ...DEFAULT_USER.preferences,
            ...(parsed.preferences || {}),
          },
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export function saveCurrentUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  logAction('settings', 'Perfil actualizado', `Rol: ${user.role}, Fondo: ${user.preferences.backgroundScene}`);
}

// Banners
export function getStoredBanners(): Banner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANNERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBanner(banner: Banner): void {
  const current = getStoredBanners();
  const idx = current.findIndex((b) => b.id === banner.id);
  let updated: Banner[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = banner;
  } else {
    updated = [...current, banner];
  }
  localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
}

export function deleteBanner(bannerId: string): void {
  const current = getStoredBanners();
  const filtered = current.filter((b) => b.id !== bannerId);
  localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(filtered));
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logAction(
  type: AuditLog['type'],
  action: string,
  details: string
): void {
  const user = getCurrentUser();
  const current = getAuditLogs();
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    user: user.name,
    role: user.role,
    action,
    details,
    type,
  };
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...current.slice(0, 99)]));
}

// Clear all content
export function clearAllContent(): void {
  localStorage.removeItem(STORAGE_KEYS.ANIMES);
  localStorage.removeItem(STORAGE_KEYS.BANNERS);
  localStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.MY_LIST);
  localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  logAction('settings', 'Biblioteca vaciada completamente', 'Restablecimiento a estado inicial 0 títulos');
}

// Optional DEMO content clearly marked as DEMO
export function loadDemoContent(): Anime[] {
  const demoAnimes: Anime[] = [
    {
      id: 'demo_kage_shinobi',
      title: 'Kage no Senshi: Crónicas del Shinobi',
      altTitle: 'Shadow Warrior: Shinobi Chronicles',
      description: 'En una Neo-Tokio consumida por la niebla cuántica y megacorporaciones de hechicería oscura, Ren, el último heredero del clan Kage, despierta una técnica de energía sombría prohibida para liberar a su hermana de la fortaleza celestial.',
      year: 2026,
      seasonPeriod: 'Primavera',
      genres: ['Acción', 'Fantasía', 'Shonen', 'Ciencia ficción', 'Sobrenatural'],
      type: 'Serie',
      status: 'En emisión',
      rating: '16+',
      audioLanguages: ['Japonés', 'Español', 'Inglés'],
      subtitlesLanguages: ['Español', 'Inglés', 'Japonés', 'Francés'],
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      isPublished: true,
      isFeatured: true,
      views: 12480,
      quality: '4K',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      isDemo: true,
      videoMetadata: {
        resolution: '4K',
        duration: 1440,
        fps: 60,
        codec: 'H.265 / HEVC',
        bitrateKbps: 18500,
      },
      seasons: [
        {
          id: 'season_1',
          seasonNumber: 1,
          title: 'Temporada 1: El Despertar de la Sombra',
          episodes: [
            {
              id: 'ep_1_1',
              animeId: 'demo_kage_shinobi',
              seasonNumber: 1,
              episodeNumber: 1,
              title: 'La Chispa en la Oscuridad',
              description: 'Ren descubre que la energía oculta en sus manos no es una maldición, sino el sello del clan ancestral.',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
              duration: 596,
              durationFormatted: '09:56',
              quality: '4K',
              subtitles: [
                {
                  id: 'sub_es_1',
                  language: 'Español',
                  label: 'Español (Latinoamérica)',
                },
                {
                  id: 'sub_en_1',
                  language: 'Inglés',
                  label: 'English (Original)',
                },
              ],
              createdAt: new Date().toISOString(),
            },
            {
              id: 'ep_1_2',
              animeId: 'demo_kage_shinobi',
              seasonNumber: 1,
              episodeNumber: 2,
              title: 'Tormenta de Filamentos Púrpuras',
              description: 'Enfrentándose a los guardianes mecánicos de la torre central, Ren domina el giro de la esfera sombría.',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
              duration: 653,
              durationFormatted: '10:53',
              quality: '1080p',
              subtitles: [],
              createdAt: new Date().toISOString(),
            },
            {
              id: 'ep_1_3',
              animeId: 'demo_kage_shinobi',
              seasonNumber: 1,
              episodeNumber: 3,
              title: 'El Límite del Vacío',
              description: 'Un antiguo rival aparece portando reliquias que contrarrestan el vórtice de chakra.',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
              duration: 734,
              durationFormatted: '12:14',
              quality: '4K',
              subtitles: [],
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ],
    },
    {
      id: 'demo_cyber_ronin',
      title: 'Cyber Ronin: Éxodo 2099',
      altTitle: 'Cyber Ronin: Exodus 2099',
      description: 'Largometraje animado que narra la última defensa de la ciudadela flotante de Shinjuku por una legión de samuráis cibernéticos que desafían a una inteligencia artificial deificada.',
      year: 2025,
      seasonPeriod: 'Otoño',
      genres: ['Acción', 'Ciencia ficción', 'Drama', 'Seinen'],
      type: 'Película',
      status: 'Finalizado',
      rating: '18+',
      audioLanguages: ['Japonés', 'Español'],
      subtitlesLanguages: ['Español', 'Inglés'],
      posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      isPublished: true,
      isFeatured: false,
      views: 8940,
      quality: '1080P',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      isDemo: true,
      seasons: [],
    },
    {
      id: 'demo_sakura_realm',
      title: 'El Guardián del Vórtice Sagrado',
      altTitle: 'Guardian of the Sacred Vortex',
      description: 'Una aprendiz de miko y un ninja errante sellan fracturas interdimensionales que liberan espíritus corrompidos en los templos del monte Fuji.',
      year: 2026,
      seasonPeriod: 'Invierno',
      genres: ['Aventura', 'Fantasía', 'Sobrenatural', 'Romance'],
      type: 'OVA',
      status: 'Finalizado',
      rating: '13+',
      audioLanguages: ['Japonés', 'Español'],
      subtitlesLanguages: ['Español', 'Inglés', 'Japonés'],
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      isPublished: true,
      isFeatured: false,
      views: 5410,
      quality: '1080P',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      isDemo: true,
      seasons: [],
    },
  ];

  localStorage.setItem(STORAGE_KEYS.ANIMES, JSON.stringify(demoAnimes));
  logAction('create', 'Cargado contenido DEMO opcional', '3 animes de demostración para pruebas');
  return demoAnimes;
}
