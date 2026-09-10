import React, { useEffect, useRef, useState } from 'react';
import { Anime } from '../../types/anime';
import animeMasterBg from '../../assets/images/anime_master_bg_1789013498471.jpg';
import animeActionBg from '../../assets/images/anime_action_bg_1789013511275.jpg';

export type BackgroundScene =
  | 'all_animes'
  | 'epic_battle'
  | 'cyberpunk'
  | 'sakura_forest'
  | 'ninja_shrine'
  | 'futuristic'
  | 'snow_mountain'
  | 'starry_sky';

interface DynamicBackgroundProps {
  scene?: BackgroundScene;
  enabled?: boolean;
  animes?: Anime[];
  activeAnime?: Anime | null;
}

// Curated high-resolution anime wallpaper scenes
const ANIME_WALLPAPERS: Record<BackgroundScene, { title: string; image: string; accent: string }> = {
  all_animes: {
    title: 'Paisaje Anime Shinkai (Generado por IA)',
    image: animeMasterBg,
    accent: '#8b5cf6',
  },
  epic_battle: {
    title: 'Universo Cósmico Anime (Generado por IA)',
    image: animeActionBg,
    accent: '#ec4899',
  },
  cyberpunk: {
    title: 'Cyberpunk Neo-Tokyo',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=85',
    accent: '#06b6d4',
  },
  sakura_forest: {
    title: 'Bosque Sagrado de Sakura & Torii',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&auto=format&fit=crop&q=85',
    accent: '#f43f5e',
  },
  ninja_shrine: {
    title: 'Santuario Shinobi de las Sombras',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&auto=format&fit=crop&q=85',
    accent: '#a855f7',
  },
  futuristic: {
    title: 'Metrópolis Futurista Anime',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1920&auto=format&fit=crop&q=85',
    accent: '#3b82f6',
  },
  snow_mountain: {
    title: 'Cumbres Nevadas & Vía Láctea',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=85',
    accent: '#38bdf8',
  },
  starry_sky: {
    title: 'Cielo Estrellado Cósmico',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=85',
    accent: '#818cf8',
  },
};

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  scene = 'all_animes',
  enabled = true,
  animes = [],
  activeAnime = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Subtle parallax effect on mouse movement
  useEffect(() => {
    if (!enabled) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  // Floating particles canvas animation (sakura, glowing embers, anime motes)
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle count & characteristics based on scene
    const isSakura = scene === 'sakura_forest';
    const isBattle = scene === 'epic_battle';
    const itemCount = isSakura ? 45 : isBattle ? 50 : 35;

    const items: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      angle: number;
      vAngle: number;
      alpha: number;
      color: string;
    }> = [];

    const palette = isSakura
      ? ['#fda4af', '#f472b6', '#fb7185']
      : isBattle
      ? ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b']
      : ['#c084fc', '#38bdf8', '#a78bfa', '#ffffff'];

    for (let i = 0; i < itemCount; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8 + (isSakura ? 0.6 : 0),
        vy: isSakura ? Math.random() * 1.2 + 0.6 : (Math.random() - 0.5) * 0.6 - 0.2,
        size: isSakura ? Math.random() * 5 + 3 : Math.random() * 2.5 + 1.2,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.04,
        alpha: Math.random() * 0.5 + 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      items.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vAngle;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (isSakura) {
          // Draw delicate sakura petal ellipse
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw glowing luminous particle
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [scene, enabled]);

  if (!enabled) {
    return <div className="fixed inset-0 z-[-1] bg-[#07090e]" />;
  }

  const currentWallpaper = ANIME_WALLPAPERS[scene] || ANIME_WALLPAPERS.all_animes;
  const customBanner = activeAnime?.bannerUrl || null;

  return (
    <div
      id="dynamic-background-container"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Deep Space Base Background */}
      <div className="absolute inset-0 bg-[#06080d]" />

      {/* 2. Main Anime Wallpaper Image with Parallax & Ken Burns Drift */}
      <div
        className="absolute inset-0 transition-transform duration-1000 ease-out will-change-transform"
        style={{
          transform: `scale(1.06) translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      >
        <img
          src={currentWallpaper.image}
          alt={currentWallpaper.title}
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.12] saturate-[1.18] transition-opacity duration-1000"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic active anime banner overlay if specified */}
        {customBanner && (
          <div className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-1000">
            <img
              src={customBanner}
              alt="Backdrop"
              className="w-full h-full object-cover filter blur-[1px] brightness-75"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Anime Speedlines & Atmosphere */}
        <div className="absolute inset-0 anime-speedlines opacity-20" />

        {/* Ambient Neon Colored Aura Bloom */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-25"
          style={{ backgroundColor: currentWallpaper.accent }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-20"
          style={{ backgroundColor: currentWallpaper.accent }}
        />
      </div>

      {/* 3. Floating Anime Canvas Particles (sakura petals, fireflies, cosmic embers) */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* 4. Cinematic Dark Vignette (Guarantees WCAG AA high contrast for typography and UI cards) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/45 to-[#07090e]/75 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#07090e_90%)] opacity-80 pointer-events-none" />
    </div>
  );
};
