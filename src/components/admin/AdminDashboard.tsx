import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Copy,
  Database,
  Eye,
  EyeOff,
  Film,
  FolderTree,
  HardDrive,
  Layers,
  LayoutDashboard,
  ListPlus,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Tv,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import { Anime, AuditLog, Banner, UserProfile, UserRole } from '../../types/anime';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface AdminDashboardProps {
  animes: Anime[];
  currentUser: UserProfile;
  auditLogs: AuditLog[];
  banners: Banner[];
  onOpenUpload: () => void;
  onEditAnime: (anime: Anime) => void;
  onManageEpisodes: (anime: Anime) => void;
  onTogglePublish: (animeId: string) => void;
  onDuplicateAnime: (animeId: string) => void;
  onDeleteAnime: (animeId: string) => void;
  onLoadDemo: () => void;
  onResetAllData: () => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  animes,
  currentUser,
  auditLogs,
  banners,
  onOpenUpload,
  onEditAnime,
  onManageEpisodes,
  onTogglePublish,
  onDuplicateAnime,
  onDeleteAnime,
  onLoadDemo,
  onResetAllData,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'analytics' | 'users' | 'storage' | 'logs' | 'settings'>('content');
  const [contentSearch, setContentSearch] = useState('');
  const [pendingDeleteAnime, setPendingDeleteAnime] = useState<Anime | null>(null);

  // Security RBAC Check
  const hasAccess = currentUser.role === 'ADMIN' || currentUser.role === 'CREATOR';
  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto pt-36 pb-20 px-4 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-red-500/30">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Esta sección está reservada exclusivamente para administradores y creadores autorizados de KAGESTREAM.
          </p>
          <p className="text-xs text-violet-400 font-mono">
            Tu rol actual: {currentUser.role}. Cambia tu rol en el selector superior para continuar las pruebas.
          </p>
        </div>
      </div>
    );
  }

  // Metrics calculation
  const totalTitles = animes.length;
  const animeSeries = animes.filter((a) => a.type === 'Serie').length;
  const movies = animes.filter((a) => a.type === 'Película').length;
  const ovas = animes.filter((a) => a.type === 'OVA' || a.type === 'Especial').length;
  const totalEpisodes = animes.reduce(
    (acc, a) => acc + (a.seasons?.reduce((eAcc, s) => eAcc + (s.episodes?.length || 0), 0) || 0),
    0
  );
  const totalViews = animes.reduce((acc, a) => acc + (a.views || 0), 0);
  const estimatedStorageMb = (totalEpisodes * 350 + movies * 1200 + totalTitles * 5).toFixed(1);

  // Filtered animes in table
  const filteredTable = animes.filter((a) => {
    if (!contentSearch.trim()) return true;
    const q = contentSearch.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  return (
    <div id="kagestream-admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold">
              KAGESTREAM CONTROL CENTER
            </span>
            <span className="text-xs text-slate-400 font-mono">Rol: {currentUser.role}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Panel de Administración
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-admin-add-content"
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-900/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Subir Contenido</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Total Títulos</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {totalTitles}
          </div>
          <div className="text-[10px] text-cyan-300 mt-1">En catálogo</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Series Anime</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-violet-400">
            {animeSeries}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{totalEpisodes} episodios</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Películas & OVAs</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-indigo-300">
            {movies + ovas}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{movies} películas, {ovas} ovas</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Visualizaciones</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-400">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Reproducciones totales</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Almacenamiento</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-amber-300 font-mono">
            {Number(estimatedStorageMb) > 1024
              ? `${(Number(estimatedStorageMb) / 1024).toFixed(2)} GB`
              : `${estimatedStorageMb} MB`}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Medios & Caché</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/10">
          <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Usuarios Activos</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            1
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">1 en línea (Admin)</div>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 mb-6">
        {[
          { id: 'content', label: 'Gestión de Contenido', icon: Tv },
          { id: 'analytics', label: 'Estadísticas & Gráficas', icon: BarChart3 },
          { id: 'users', label: 'Usuarios & Permisos', icon: Users },
          { id: 'storage', label: 'Almacenamiento & Medios', icon: HardDrive },
          { id: 'logs', label: 'Logs de Auditoría', icon: Activity },
          { id: 'settings', label: 'Configuración Global', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GESTIÓN DE CONTENIDO TABLE */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Table Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                placeholder="Filtrar en catálogo..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 font-mono">
                {filteredTable.length} elementos
              </span>
            </div>
          </div>

          {/* Table */}
          {filteredTable.length === 0 ? (
            <div className="py-16 text-center rounded-3xl glass-panel border border-white/10">
              <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">
                No hay contenidos en el catálogo
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Comienza subiendo tu primer anime o película mediante el botón "+ Subir Contenido".
              </p>
              <button
                onClick={onOpenUpload}
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs"
              >
                + Subir Primer Anime
              </button>
            </div>
          ) : (
            <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Portada</th>
                      <th className="p-3.5">Título</th>
                      <th className="p-3.5">Tipo</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5">Episodios</th>
                      <th className="p-3.5">Vistas</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredTable.map((item) => {
                      const epCount = item.seasons?.reduce(
                        (acc, s) => acc + (s.episodes?.length || 0),
                        0
                      ) || 0;
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="p-3.5">
                            <img
                              src={item.posterUrl || item.bannerUrl}
                              alt={item.title}
                              className="w-10 h-14 rounded-lg object-cover bg-slate-800"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white line-clamp-1 max-w-xs sm:max-w-md">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.year} • {item.genres?.slice(0, 2).join(', ')}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-violet-600/30 text-violet-300 font-mono text-[11px]">
                              {item.type}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.isPublished
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {item.isPublished ? 'Publicado' : 'Oculto'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-200">
                            {item.type === 'Serie' ? `${epCount} eps` : 'Película'}
                          </td>
                          <td className="p-3.5 font-mono text-cyan-300">
                            {item.views?.toLocaleString() || 0}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Manage Episodes */}
                              {item.type === 'Serie' && (
                                <button
                                  onClick={() => onManageEpisodes(item)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300"
                                  title="Gestionar Episodios"
                                >
                                  <Layers className="w-4 h-4" />
                                </button>
                              )}

                              {/* Toggle Publish */}
                              <button
                                onClick={() => onTogglePublish(item.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                title={item.isPublished ? 'Ocultar' : 'Publicar'}
                              >
                                {item.isPublished ? (
                                  <Eye className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-amber-400" />
                                )}
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => onDuplicateAnime(item.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                title="Duplicar título"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setPendingDeleteAnime(item)}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                                title="Eliminar título"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/10">
            <h3 className="text-base font-display font-bold text-white mb-1">
              Visualizaciones Semanales
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Rendimiento de reproducciones y tráfico de streaming
            </p>
            {/* SVG Visualizer Chart */}
            <div className="h-56 flex items-end justify-between gap-3 pt-4 px-2 border-b border-white/10">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => {
                const heights = [45, 60, 78, 52, 90, 98, 85];
                const h = heights[idx];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-44">
                      <div
                        className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400 shadow-md transition-all duration-500 hover:brightness-125"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/10">
            <h3 className="text-base font-display font-bold text-white mb-1">
              Distribución por Género
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Volumen de títulos catalogados por categoría
            </p>
            <div className="space-y-3.5">
              {[
                { name: 'Acción / Shonen', pct: 42, color: 'bg-violet-500' },
                { name: 'Fantasía / Sobrenatural', pct: 28, color: 'bg-cyan-400' },
                { name: 'Ciencia Ficción / Mecha', pct: 18, color: 'bg-indigo-400' },
                { name: 'Romance / Drama', pct: 12, color: 'bg-pink-400' },
              ].map((g) => (
                <div key={g.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{g.name}</span>
                    <span className="text-cyan-300 font-mono font-bold">{g.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-display font-bold text-white mb-1">
              Usuarios y Roles (RBAC)
            </h3>
            <p className="text-xs text-slate-400">
              Control de acceso basado en roles para administración y streaming
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-violet-500"
                />
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">{currentUser.name} (Tú)</div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STORAGE & MEDIA */}
      {activeTab === 'storage' && (
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-display font-bold text-white mb-1">
              Arquitectura de Almacenamiento
            </h3>
            <p className="text-xs text-slate-400">
              Almacenamiento de vídeo, portadas, miniaturas y subtítulos en IndexedDB y memoria
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400 uppercase font-semibold">Vídeos & Streams</div>
              <div className="text-xl font-bold text-white mt-1">HLS / MP4 / Blob</div>
              <div className="text-[11px] text-emerald-400 mt-1">✓ Aceleración activada</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400 uppercase font-semibold">Base de Datos</div>
              <div className="text-xl font-bold text-white mt-1">IndexedDB + Storage</div>
              <div className="text-[11px] text-cyan-400 mt-1">✓ Persistencia local duradera</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400 uppercase font-semibold">Subtítulos & VTT</div>
              <div className="text-xl font-bold text-white mt-1">SRT / WebVTT Engine</div>
              <div className="text-[11px] text-violet-400 mt-1">✓ Multilingüe</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-white mb-1">
              Registro de Auditoría y Seguridad
            </h3>
            <p className="text-xs text-slate-400">
              Trazabilidad de acciones de subida, edición, eliminación y cambios de configuración
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No hay registros de auditoría aún.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.type === 'create'
                          ? 'bg-emerald-400'
                          : log.type === 'delete'
                          ? 'bg-red-400'
                          : log.type === 'update'
                          ? 'bg-cyan-400'
                          : 'bg-violet-400'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-white mr-2">{log.action}</span>
                      <span className="text-slate-400">{log.details}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: GLOBAL SETTINGS & DATA RESET */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-display font-bold text-white mb-1">
              Configuración y Herramientas del Sistema
            </h3>
            <p className="text-xs text-slate-400">
              Operaciones de mantenimiento de la plataforma
            </p>
          </div>

          {/* Standalone HTML Exporter */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <span>📦</span>
                <span>Exportar como Archivo HTML Único (100% Autónomo)</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Un solo archivo con todo el código integrado (HTML + CSS + JS nativo). No requiere servidores ni compiladores; abre inmediatamente al hacer doble clic o subir a cualquier hosting (Netlify, GitHub Pages, Vercel, cPanel).
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="./standalone.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all whitespace-nowrap"
              >
                <span>↗ Abrir</span>
              </a>
              <a
                href="./standalone.html"
                download="index.html"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all active:scale-95 shadow-lg shadow-cyan-900/30 whitespace-nowrap"
              >
                <span>⬇ Descargar index.html</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">Cargar contenido de demostración (DEMO)</div>
              <div className="text-xs text-slate-400">
                Puebla temporalmente la plataforma con 3 animes con vídeos de streaming y episodios para pruebas.
              </div>
            </div>
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cargar DEMO</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-red-300">Vaciar biblioteca completamente (Estado Inicial)</div>
              <div className="text-xs text-slate-400">
                Restaura KAGESTREAM a 0 títulos, 0 episodios, dejándola completamente limpia.
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas vaciar toda la biblioteca y volver al estado inicial de 0 títulos?')) {
                  onResetAllData();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Vaciar a 0 Títulos</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteAnime && (
        <DeleteConfirmModal
          isOpen={true}
          title={pendingDeleteAnime.title}
          onConfirm={() => {
            onDeleteAnime(pendingDeleteAnime.id);
            setPendingDeleteAnime(null);
          }}
          onCancel={() => setPendingDeleteAnime(null)}
        />
      )}
    </div>
  );
};
