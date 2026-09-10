import React, { useEffect, useRef, useState } from 'react';
import { FastForward, Sparkles, Volume2, VolumeX, Play } from 'lucide-react';
import { KageLogo } from '../common/KageLogo';

interface CinematicIntroProps {
  onComplete: () => void;
  reduceMotion?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  reduceMotion = false,
}) => {
  // Phase sequence: 1: Chakra Seal, 2: Shinobi Dash, 3: Rasen Sphere, 4: Impact, 5: Logo & Welcome
  const [phase, setPhase] = useState<number>(reduceMotion ? 5 : 1);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio tone synthesizer for anime energy buildup
  const playSynthSound = (type: 'hum' | 'charge' | 'impact') => {
    if (!audioFeedback || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hum') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.4);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === 'charge') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 1.0);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
        osc.start();
        osc.stop(ctx.currentTime + 1.0);
      } else if (type === 'impact') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch {
      // Audio autoplay handled safely
    }
  };

  // Smooth progress bar 0% -> 100% over 4.2 seconds
  useEffect(() => {
    const startTime = Date.now();
    const duration = 4400;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgressPercent(pct);
      if (pct >= 100) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      const timer = setTimeout(() => onComplete(), 1200);
      return () => clearTimeout(timer);
    }

    // Dynamic, punchy anime entrance sequence (4.4s total):
    // 0ms: Phase 1 (Chakra seal & energy pulse)
    playSynthSound('hum');

    // 1100ms: Phase 2 (Ninja Dash)
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 1100);

    // 2100ms: Phase 3 (Rasen Sphere Formed)
    const t3 = setTimeout(() => {
      setPhase(3);
      playSynthSound('charge');
    }, 2100);

    // 3000ms: Phase 4 (Dimensional Slash & Screen Impact)
    const t4 = setTimeout(() => {
      setPhase(4);
      playSynthSound('impact');
    }, 3000);

    // 3400ms: Phase 5 (Grand KAGESTREAM Logo Reveal & Welcome)
    const t5 = setTimeout(() => {
      setPhase(5);
    }, 3400);

    // 4400ms: Complete and enter smoothly
    const t6 = setTimeout(() => {
      onComplete();
    }, 4400);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [reduceMotion]);

  // Particle and energy vortex canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particleCount = 70;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4',
      alpha: Math.random() * 0.7 + 0.3,
    }));

    let vortexAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      vortexAngle += 0.05;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw floating glowing particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw swirling chakra energy vortex in phases 2 & 3
      if (phase === 2 || phase === 3) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(vortexAngle);

        for (let i = 0; i < 4; i++) {
          ctx.rotate((Math.PI * 2) / 4);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(40, -30, 90, 50, 130, 0);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(139, 92, 246, 0.7)' : 'rgba(6, 182, 212, 0.7)';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#8b5cf6';
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [phase]);

  return (
    <div
      id="cinematic-intro-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#050609] overflow-hidden select-none p-6"
    >
      {/* Background canvas for particles & chakra swirl */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Speed lines on dash and impact */}
      {(phase === 2 || phase === 3 || phase === 4) && (
        <div className="absolute inset-0 anime-speedlines opacity-40 animate-pulse pointer-events-none" />
      )}

      {/* TOP BAR: Controls & Audio Toggle */}
      <div className="relative z-50 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-intro-audio"
            onClick={() => setAudioFeedback(!audioFeedback)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs text-slate-300 hover:text-white transition-all border border-white/10"
          >
            {audioFeedback ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Audio activado</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Silenciado</span>
              </>
            )}
          </button>

          <span className="px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-[11px] font-bold text-violet-300 uppercase tracking-widest hidden sm:inline">
            Intro Shinobi
          </span>
        </div>

        {/* Skip button */}
        <button
          id="btn-skip-intro"
          onClick={onComplete}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-slate-300 hover:text-white hover:border-violet-500 transition-all border border-white/15 active:scale-95"
        >
          <FastForward className="w-3.5 h-3.5 text-violet-400" />
          <span>Omitir</span>
        </button>
      </div>

      {/* CENTER STAGE: Dynamic Animated Sequence */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full max-w-xl text-center">
        {/* STAGE 1: Chakra Seal & Mystic Glyphs */}
        {phase === 1 && (
          <div className="flex flex-col items-center animate-fade-in">
            {/* Spinning Arcane Shinobi Seal */}
            <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/60 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-cyan-400/50 animate-spin-reverse" />
              <div className="w-16 h-16 rounded-full bg-violet-600/30 border border-violet-400 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.8)]">
                <span className="text-2xl font-black text-cyan-300 font-display">影</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-2xl font-display font-extrabold text-white tracking-wider mb-2">
              <span className="text-anime-gradient">INVOCANDO PORTAL SHINOBI</span>
            </h2>
            <p className="text-xs sm:text-sm text-violet-300/80 tracking-widest uppercase">
              Despertando la energía del clan Kage...
            </p>
          </div>
        )}

        {/* STAGE 2 & 3: Ninja Silhouette & Chakra Sphere */}
        {(phase === 2 || phase === 3) && (
          <div className="flex flex-col items-center animate-fade-in">
            {/* Dynamic anime ninja vector */}
            <div
              className={`relative transition-transform duration-500 ${
                phase === 3 ? 'scale-110' : 'scale-95 animate-bounce'
              }`}
            >
              {/* Chakra aura glow */}
              <div className="absolute -inset-6 bg-gradient-to-t from-violet-600/50 via-cyan-400/30 to-transparent blur-2xl rounded-full animate-pulse" />

              <svg
                width="220"
                height="220"
                viewBox="0 0 200 200"
                className="drop-shadow-[0_0_25px_rgba(139,92,246,0.9)] relative z-10"
                fill="none"
              >
                {/* Ninja Scarf Flowing */}
                <path
                  d="M70 70 C 30 90, 10 140, 5 180 C 30 160, 65 130, 80 100 Z"
                  fill="url(#ninjaGradIntro)"
                />
                <path
                  d="M130 70 C 170 90, 190 140, 195 180 C 170 160, 135 130, 120 100 Z"
                  fill="url(#ninjaGradIntro)"
                />
                {/* Ninja Armor */}
                <path d="M75 70 L125 70 L115 130 L85 130 Z" fill="#0c101c" stroke="#6366f1" strokeWidth="2" />
                {/* Dynamic legs */}
                <path d="M85 130 L65 180 L50 175" stroke="#101526" strokeWidth="10" strokeLinecap="round" />
                <path d="M115 130 L135 175 L155 190" stroke="#101526" strokeWidth="10" strokeLinecap="round" />
                {/* Reaching arms */}
                <path d="M75 80 Q 95 110 98 120" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                <path d="M125 80 Q 105 110 102 120" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                {/* Mask & Head */}
                <circle cx="100" cy="50" r="20" fill="#0b0e1b" stroke="#8b5cf6" strokeWidth="2" />
                <rect x="82" y="40" width="36" height="8" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                <ellipse cx="94" cy="51" rx="3" ry="1.5" fill="#38bdf8" />
                <ellipse cx="106" cy="51" rx="3" ry="1.5" fill="#38bdf8" />
                {/* Headband tails */}
                <path d="M82 44 Q 50 35 30 55" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                <defs>
                  <linearGradient id="ninjaGradIntro" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-4">
              <span className="px-4 py-1.5 rounded-full bg-violet-950/80 border border-violet-500 text-cyan-300 text-xs font-extrabold tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse">
                {phase === 2 ? '⚡ CARGANDO CHAKRA' : '💥 ¡DANZA DE LAS SOMBRAS!'}
              </span>
            </div>
          </div>
        )}

        {/* STAGE 4: Dimensional Impact Flash */}
        {phase === 4 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-cyan-400/80 mix-blend-screen transition-opacity">
            <div className="w-full h-full bg-radial from-white via-cyan-300 to-violet-950 opacity-90 animate-ping" />
          </div>
        )}

        {/* STAGE 5: Grand Logo Reveal & Chromatic Colors */}
        {phase >= 5 && (
          <div className="flex flex-col items-center justify-center animate-fade-in">
            {/* Background Halo */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-transparent blur-3xl" />

            <div className="transform scale-110 sm:scale-125 mb-4 drop-shadow-[0_0_40px_rgba(139,92,246,0.9)]">
              <KageLogo size="xl" showSlogan={false} animated={true} />
            </div>

            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-2">
              <span className="text-anime-gradient">TU UNIVERSO ANIME COMIENZA AQUÍ</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md">
              Streaming en alta definición, audio original, doblaje latino y subtítulos sincronizados.
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM BAR: Progress Bar & Instant Enter Button */}
      <div className="relative z-50 w-full max-w-md mx-auto flex flex-col items-center gap-3">
        {/* Percentage Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>Iniciando KAGESTREAM</span>
            </span>
            <span className="font-mono text-cyan-300">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-100 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* High-visibility "ENTRAR AHORA" Action Button */}
        <button
          id="btn-intro-enter-now"
          onClick={onComplete}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-display font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all active:scale-95 group border border-white/20"
        >
          <Play className="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform" />
          <span>ENTRAR A KAGESTREAM</span>
        </button>
      </div>
    </div>
  );
};
