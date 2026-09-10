import React, { useState } from 'react';
import {
  Bell,
  Check,
  Film,
  Monitor,
  Moon,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  User,
  Volume2,
  X,
} from 'lucide-react';
import { UserPreferences, UserProfile, UserRole } from '../../types/anime';
import { BackgroundScene } from '../background/DynamicBackground';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
];

const SCENE_OPTIONS: Array<{ id: BackgroundScene; label: string; desc: string }> = [
  { id: 'cyberpunk', label: 'Ciudad Cyberpunk', desc: 'Neones nocturnos y rascacielos' },
  { id: 'sakura_forest', label: 'Bosque de Sakura', desc: 'Torii sagrado y pétalos flotantes' },
  { id: 'ninja_shrine', label: 'Templo Ninja', desc: 'Linternas y luna púrpura' },
  { id: 'futuristic', label: 'Metrópolis Futurista', desc: 'Autopistas de luz cuántica' },
  { id: 'snow_mountain', label: 'Montaña & Aurora', desc: 'Cumbres nevadas y cielo polar' },
  { id: 'starry_sky', label: 'Cielo Estrellado', desc: 'Nebulosas cósmicas infinitas' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  showToast,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [preferences, setPreferences] = useState<UserPreferences>({ ...currentUser.preferences });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name,
      email,
      avatarUrl,
      role,
      preferences,
    };
    onSaveProfile(updated);
    showToast('success', 'Preferencias guardadas');
    onClose();
  };

  return (
    <div
      id="profile-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl my-auto bg-[#090c16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Perfil y Preferencias
              </h2>
              <p className="text-xs text-slate-400">
                Personaliza tu experiencia de streaming y rol activo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl glass-panel border border-white/10">
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500 shadow-lg"
            />
            <div className="space-y-2 flex-grow text-center sm:text-left w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold uppercase mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold uppercase mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                  Elegir Avatar Shinobi
                </label>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-8 h-8 rounded-lg overflow-hidden border transition-all ${
                        avatarUrl === url ? 'border-cyan-400 scale-110 shadow-md' : 'border-white/20 opacity-70'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Rol del Usuario (Permisos)</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['USER', 'CREATOR', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === r
                      ? 'bg-violet-600/30 border-violet-500 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-xs font-mono">{r}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {r === 'ADMIN'
                      ? 'Acceso total y gestión'
                      : r === 'CREATOR'
                      ? 'Subir contenidos'
                      : 'Visualización y listas'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Scene Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Fondo Dinámico e Intercambiable</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCENE_OPTIONS.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() =>
                    setPreferences({ ...preferences, backgroundScene: scene.id })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    preferences.backgroundScene === scene.id
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-xs">{scene.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{scene.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches: Fondo animado, Animación intro, Reducir movimiento */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between p-3 rounded-xl glass-panel border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Fondo animado (Partículas y Parallax)
                </span>
                <span className="text-[11px] text-slate-400">
                  Activa o desactiva los efectos de movimiento en el fondo
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.animatedBackground}
                onChange={(e) =>
                  setPreferences({ ...preferences, animatedBackground: e.target.checked })
                }
                className="w-5 h-5 accent-violet-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl glass-panel border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Reducir movimiento
                </span>
                <span className="text-[11px] text-slate-400">
                  Desactiva animaciones intensas para mayor confort visual
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.reduceMotion}
                onChange={(e) =>
                  setPreferences({ ...preferences, reduceMotion: e.target.checked })
                }
                className="w-5 h-5 accent-violet-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl glass-panel text-xs text-slate-300 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-900/40"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
