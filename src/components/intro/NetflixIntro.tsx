import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface NetflixIntroProps {
  onComplete: () => void;
  reduceMotion?: boolean;
}

export const NetflixIntro: React.FC<NetflixIntroProps> = ({
  onComplete,
  reduceMotion = false,
}) => {
  // Intro Phases:
  // 1: Black silence (0 - 400ms)
  // 2: The "TA-DUM" impact & Bold Red Logo flash (400ms - 1500ms)
  // 3: The Prismatic Spectrum Ribbons explosion & zoom (1500ms - 3100ms)
  // 4: The KAGESTREAM Cinematic Title reveal & fadeout (3100ms - 3900ms)
  const [phase, setPhase] = useState<number>(reduceMotion ? 4 : 1);
  const [muted, setMuted] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Synthesize authentic cinematic "TA-DUM" using Web Audio API
  const playTaDumSound = () => {
    if (muted || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const t = ctx.currentTime;

      // FIRST HIT: "TA" (Deep Sub-bass punch + low mid transient)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, t);
      osc1.frequency.exponentialRampToValueAtTime(32, t + 0.35);
      gain1.gain.setValueAtTime(0.4, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.4);

      // SECOND HIT: "DUM" (Massive Sub impact + orchestral brass & chordal reverberation)
      const t2 = t + 0.18; // 180ms delay for the iconic cadence
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(110, t2);
      osc2.frequency.exponentialRampToValueAtTime(38, t2 + 1.2);

      // Low-pass filter for warm cinematic body
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, t2);
      filter.frequency.exponentialRampToValueAtTime(120, t2 + 1.2);

      gain2.gain.setValueAtTime(0.01, t);
      gain2.gain.setValueAtTime(0.45, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 1.6);

      osc2.connect(filter);
      filter.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 1.7);

      // Atmospheric high shimmer harmonic (ambient resonance)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(440, t2);
      osc3.frequency.exponentialRampToValueAtTime(220, t2 + 1.8);
      gain3.gain.setValueAtTime(0.08, t2);
      gain3.gain.exponentialRampToValueAtTime(0.0001, t2 + 2.0);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(t2);
      osc3.stop(t2 + 2.1);
    } catch {
      // Audio autoplay policy handled safely
    }
  };

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem('kagestream_seen_intro', 'true');
      } catch {}
      onComplete();
    }, 400);
  };

  // Run the sequence
  useEffect(() => {
    if (reduceMotion) {
      const t = setTimeout(handleFinish, 800);
      return () => clearTimeout(t);
    }

    // 0.3s: Trigger Phase 2 and play TA-DUM
    const t1 = setTimeout(() => {
      setPhase(2);
      playTaDumSound();
    }, 350);

    // 1.5s: Trigger Phase 3 (Prismatic vertical ribbons zoom)
    const t2 = setTimeout(() => {
      setPhase(3);
    }, 1450);

    // 2.7s: Trigger Phase 4 (KAGESTREAM Identity)
    const t3 = setTimeout(() => {
      setPhase(4);
    }, 2700);

    // 3.8s: Complete and enter
    const t4 = setTimeout(() => {
      handleFinish();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reduceMotion]);

  // Canvas animation for Netflix Prismatic Ribbons
  useEffect(() => {
    if (phase < 2 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate vertical light ribbons (the iconic Netflix spectrum)
    const ribbonCount = 70;
    const colors = [
      '#E50914', // Netflix Red
      '#B20710', // Deep Crimson
      '#FF2E36', // Neon Red
      '#FF007F', // Magenta
      '#9B51E0', // Deep Violet
      '#7928CA', // Purple
      '#00DFD8', // Electric Cyan
      '#0070F3', // Cobalt Blue
      '#FF4500', // Fiery Orange
      '#FFB800', // Gold
    ];

    interface Ribbon {
      x: number;
      speedX: number;
      width: number;
      color: string;
      alpha: number;
      heightFactor: number;
      depth: number;
    }

    const ribbons: Ribbon[] = [];
    const centerX = width / 2;

    for (let i = 0; i < ribbonCount; i++) {
      const offset = (Math.random() - 0.5) * 80;
      const dir = offset >= 0 ? 1 : -1;
      ribbons.push({
        x: centerX + offset,
        speedX: dir * (Math.random() * 8 + 2),
        width: Math.random() * 10 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        heightFactor: Math.random() * 0.4 + 0.8,
        depth: Math.random() * 0.8 + 0.2,
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // In Phase 3: Ribbons expand horizontally and surge towards camera
      if (phase >= 3) {
        ribbons.forEach((r) => {
          r.x += r.speedX * 1.5;
          r.width += 0.8;
          r.alpha *= 0.985;

          ctx.save();
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.fillStyle = r.color;
          ctx.shadowColor = r.color;
          ctx.shadowBlur = 18;

          const h = height * r.heightFactor;
          const y = (height - h) / 2;
          ctx.fillRect(r.x, y, r.width, h);
          ctx.restore();
        });

        // Horizontal anamorphic lens flare line
        ctx.save();
        ctx.globalAlpha = Math.max(0, 0.4 - frame * 0.005);
        const grad = ctx.createLinearGradient(0, height / 2, width, height / 2);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.3, 'rgba(229, 9, 20, 0.6)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.7, 'rgba(121, 40, 202, 0.6)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, height / 2 - 2, width, 4);
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [phase]);

  return (
    <div
      id="netflix-style-intro-overlay"
      onClick={handleFinish}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden cursor-pointer transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Canvas for Light Ribbons Spectrum */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Atmospheric Vignette & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Netflix-Style Animated Lettermark */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* The Iconic Netflix-Style Monogram (Stylized Crimson "K" / "N" with curved depth) */}
        {phase >= 2 && phase < 4 && (
          <div
            className={`relative transition-all duration-1000 ease-out transform ${
              phase === 2
                ? 'scale-100 opacity-100 filter drop-shadow-[0_0_35px_rgba(229,9,20,0.85)]'
                : 'scale-[2.8] opacity-0 filter blur-sm drop-shadow-[0_0_80px_rgba(229,9,20,1)]'
            }`}
          >
            {/* Netflix Iconic Monogram SVG - Iconic Letter "K" for KAGESTREAM */}
            <svg
              viewBox="0 0 160 220"
              className="w-32 h-44 sm:w-44 sm:h-60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Netflix Red Gradients */}
                <linearGradient id="nfx-left-bar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8A050B" />
                  <stop offset="50%" stopColor="#B20710" />
                  <stop offset="100%" stopColor="#E50914" />
                </linearGradient>
                <linearGradient id="nfx-upper-diagonal" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9B060E" />
                  <stop offset="60%" stopColor="#E50914" />
                  <stop offset="100%" stopColor="#FF2E36" />
                </linearGradient>
                <linearGradient id="nfx-diagonal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF262E" />
                  <stop offset="35%" stopColor="#E50914" />
                  <stop offset="75%" stopColor="#B20710" />
                  <stop offset="100%" stopColor="#750409" />
                </linearGradient>
                {/* 3D Drop Shadow for the overlapping diagonal ribbon */}
                <filter id="ribbon-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="-5" dy="2" stdDeviation="5" floodColor="#000000" floodOpacity="0.9" />
                </filter>
                <filter id="upper-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="2" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* 1. Left Vertical Pillar (Classic Netflix stem with curve at base) */}
              <path
                d="M28 10 L64 10 L64 200 C52 204 40 204 28 200 Z"
                fill="url(#nfx-left-bar)"
              />

              {/* 2. Upper Diagonal Arm (angles up to top-right) */}
              <path
                d="M54 126 L108 10 L144 10 L80 142 Z"
                fill="url(#nfx-upper-diagonal)"
                filter="url(#upper-shadow)"
              />

              {/* 3. Lower Diagonal Ribbon (overlapping with iconic 3D drop shadow) */}
              <path
                d="M62 98 L94 98 L148 200 C136 204 122 204 110 200 L62 124 Z"
                fill="url(#nfx-diagonal)"
                filter="url(#ribbon-shadow)"
              />
            </svg>

            {/* Glowing Floor Reflection (Classic Netflix cinema look) */}
            <div className="w-56 h-8 bg-gradient-to-r from-transparent via-[#E50914]/40 to-transparent blur-md -mt-4 mx-auto rounded-full" />
          </div>
        )}

        {/* Phase 4: Sleek Cinematic Netflix-Style KAGESTREAM Logo Reveal */}
        {phase === 4 && (
          <div className="flex flex-col items-center animate-fade-in text-center px-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-[0.25em] text-[#E50914] drop-shadow-[0_0_35px_rgba(229,9,20,0.9)] uppercase">
              KAGESTREAM
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E50914]" />
              <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.35em] text-slate-300 uppercase">
                TU UNIVERSO ANIME
              </p>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E50914]" />
            </div>
          </div>
        )}
      </div>

      {/* Top / Bottom Controls: Mute & Skip Button */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          id="btn-intro-toggle-mute"
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/70 hover:text-white border border-white/20 backdrop-blur-md transition-all"
          title={muted ? 'Activar sonido Ta-dum' : 'Silenciar'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
        </button>

        <button
          id="btn-skip-netflix-intro"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95"
        >
          Omitir intro ➔
        </button>
      </div>

      {/* Bottom Subtle Hint */}
      <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
        <span className="text-[11px] text-white/30 font-mono tracking-widest uppercase">
          Toca o haz clic para entrar
        </span>
      </div>
    </div>
  );
};
