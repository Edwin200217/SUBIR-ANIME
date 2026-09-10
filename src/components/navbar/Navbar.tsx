import React, { useEffect, useState } from 'react';
import {
  Bell,
  Compass,
  Film,
  Flame,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  ListPlus,
  Menu,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tv,
  User,
  X,
  Zap,
} from 'lucide-react';
import { KageLogo } from '../common/KageLogo';
import { UserProfile, UserRole } from '../../types/anime';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  onChangeRole: (role: UserRole) => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  onSelectBackgroundScene?: (
    scene:
      | 'all_animes'
      | 'epic_battle'
      | 'cyberpunk'
      | 'sakura_forest'
      | 'ninja_shrine'
      | 'futuristic'
      | 'snow_mountain'
      | 'starry_sky'
  ) => void;
  unreadCount?: number;
}

const BG_SCENES = [
  { id: 'all_animes', label: 'Paisaje Anime Shinkai (IA)', icon: '🌸' },
  { id: 'epic_battle', label: 'Universo Cósmico Anime (IA)', icon: '✨' },
  { id: 'cyberpunk', label: 'Cyberpunk Neo-Tokyo', icon: '🏙️' },
  { id: 'sakura_forest', label: 'Bosque de Sakura & Torii', icon: '⛩️' },
  { id: 'ninja_shrine', label: 'Santuario Shinobi', icon: '🏮' },
  { id: 'starry_sky', label: 'Cielo Estrellado', icon: '🌌' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onChangeRole,
  onOpenSearch,
  onOpenUpload,
  onOpenProfile,
  onSelectBackgroundScene,
  unreadCount = 0,
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);
  const [bgDropdownOpen, setBgDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Inicio' },
    { id: 'anime', label: 'Anime' },
    { id: 'movies', label: 'Películas' },
    { id: 'series', label: 'Series' },
    { id: 'genres', label: 'Géneros' },
    { id: 'trending', label: 'Tendencias' },
    { id: 'my-list', label: 'Mi lista' },
    { id: 'history', label: 'Historial' },
  ];

  const canUpload = currentUser.role === 'ADMIN' || currentUser.role === 'CREATOR';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <>
      <header
        id="kagestream-navbar"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#07090e]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2'
            : 'bg-gradient-to-b from-[#07090e]/90 via-[#07090e]/50 to-transparent py-2.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <KageLogo
              size="md"
              showSlogan={false}
              onClick={() => onSelectTab('home')}
            />

            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => onSelectTab(link.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-violet-600/30 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              id="btn-open-search"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all group"
              title="Buscar anime (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-slate-400">Buscar...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded border border-white/10 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Quick Background Theme Switcher */}
            <div className="relative hidden md:block">
              <button
                id="btn-toggle-bg-scene"
                onClick={() => {
                  setBgDropdownOpen(!bgDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 hover:text-white transition-all group"
                title="Cambiar fondo animado (Todos los Animes, Batalla, Sakura)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Fondo Anime</span>
              </button>

              {bgDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl glass-panel border border-cyan-500/30 p-2 shadow-2xl z-50 text-xs space-y-1">
                  <div className="px-2 py-1 text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    Fondo de Pantalla
                  </div>
                  {BG_SCENES.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        onSelectBackgroundScene?.(bg.id as any);
                        setBgDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                        currentUser.preferences.backgroundScene === bg.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{bg.icon}</span>
                        <span>{bg.label}</span>
                      </span>
                      {currentUser.preferences.backgroundScene === bg.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Button (if Creator or Admin) */}
            {canUpload && (
              <button
                id="btn-navbar-upload"
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-900/30 hover:shadow-violet-600/40 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Subir</span>
              </button>
            )}

            {/* Admin Panel Button (if Admin) */}
            {isAdmin && (
              <button
                id="btn-navbar-admin"
                onClick={() => onSelectTab('admin')}
                className={`hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  currentTab === 'admin'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-cyan-300'
                }`}
                title="Panel de Administración"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Admin</span>
              </button>
            )}

            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                id="btn-role-switcher-toggle"
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setBgDropdownOpen(false);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-violet-500/30 text-[11px] font-mono tracking-wider font-semibold text-violet-300 hover:border-violet-400 transition-all"
                title="Cambiar rol activo para probar permisos"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                      : currentUser.role === 'CREATOR'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span>{currentUser.role}</span>
              </button>

              {roleDropdownOpen && (
                <div
                  id="role-switcher-dropdown"
                  className="absolute right-0 mt-2 w-44 rounded-xl glass-panel border border-white/15 p-1.5 shadow-2xl z-50 text-xs"
                >
                  <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-semibold">
                    Alternar rol para pruebas
                  </div>
                  {(['ADMIN', 'CREATOR', 'USER'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      id={`btn-switch-role-${role}`}
                      onClick={() => {
                        onChangeRole(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                        currentUser.role === role
                          ? 'bg-violet-600/30 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{role}</span>
                      {currentUser.role === role && <span className="text-cyan-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              id="btn-open-user-profile"
              onClick={onOpenProfile}
              className="relative p-1 rounded-full border border-violet-500/40 hover:border-cyan-400 transition-all group"
              title="Mi perfil y configuración"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090e]" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="btn-toggle-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden px-4 pt-3 pb-6 border-t border-white/10 bg-[#07090e]/95 backdrop-blur-xl animate-fade-in"
          >
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    currentTab === link.id
                      ? 'bg-violet-600/30 text-white border border-violet-500/40'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              {canUpload && (
                <button
                  id="btn-mobile-upload"
                  onClick={() => {
                    onOpenUpload();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Subir Anime</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    onSelectTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-sm font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Panel de Administración</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
