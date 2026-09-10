import React from 'react';

interface KageLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KageLogo: React.FC<KageLogoProps> = ({
  size = 'md',
  showSlogan = false,
  animated = true,
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl sm:text-5xl',
  }[size];

  return (
    <div
      id="kagestream-brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Ninja Shadow / Energy Orb Logo Mark */}
      <div className={`relative flex items-center justify-center ${iconDimensions}`}>
        {/* Glow halo */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 opacity-60 blur-md ${
            animated ? 'animate-pulse' : ''
          }`}
        />

        {/* Outer rotating chakra blades */}
        <svg
          viewBox="0 0 100 100"
          className={`relative w-full h-full text-violet-400 drop-shadow-[0_0_12px_rgba(139,92,246,0.8)] ${
            animated ? 'animate-spin-slow' : ''
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ninja shadow energy emblem: 4 curved aerodynamic energy blades */}
          <path
            d="M50 8C52 24 64 36 80 38C64 42 52 54 50 70C48 54 36 42 20 38C36 36 48 24 50 8Z"
            fill="url(#ninjaGrad)"
            stroke="#c084fc"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="50" r="12" fill="#090b14" stroke="#06b6d4" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="6" fill="#38bdf8" />
          {/* Whirling spiral energy rings */}
          <path
            d="M50 22A28 28 0 0 1 78 50"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M50 78A28 28 0 0 1 22 50"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="ninjaGrad" x1="20" y1="8" x2="80" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" />
              <stop offset="0.5" stopColor="#6366f1" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-display font-extrabold tracking-wider leading-none flex items-center ${textSizes}`}>
          <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">KAGE</span>
          <span className="text-anime-gradient drop-shadow-[0_0_15px_rgba(139,92,246,0.7)] ml-0.5">
            STREAM
          </span>
        </div>
        {showSlogan && (
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase mt-1 text-anime-gradient-gold drop-shadow-sm">
            Tu universo anime comienza aquí
          </span>
        )}
      </div>
    </div>
  );
};
