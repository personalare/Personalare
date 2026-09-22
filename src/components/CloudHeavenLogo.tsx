import React from 'react';

interface CloudHeavenLogoProps {
  variant?: 'badge' | 'horizontal' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  mode?: 'dark' | 'light';
  className?: string;
}

export const CloudHeavenLogo: React.FC<CloudHeavenLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  mode = 'light',
  className = '',
}) => {
  // Dimension mappings
  const getDimensions = () => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
    switch (size) {
      case 'xs':
        return { width: 28, height: 28 };
      case 'sm':
        return { width: 36, height: 36 };
      case 'lg':
        return { width: 64, height: 64 };
      case 'xl':
        return { width: 96, height: 96 };
      case 'md':
      default:
        return { width: 44, height: 44 };
    }
  };

  const dims = getDimensions();

  // The official vector emblem with golden orbital swirl and mountain villa
  const EmblemSvg = (
    <svg
      viewBox="0 0 500 500"
      width={dims.width}
      height={dims.height}
      className="shrink-0 drop-shadow-sm select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="chLogoMatteBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2F3034" />
          <stop offset="100%" stopColor="#222326" />
        </radialGradient>
        <linearGradient id="chAmberGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFBF38" />
          <stop offset="50%" stopColor="#F3A824" />
          <stop offset="100%" stopColor="#D98207" />
        </linearGradient>
      </defs>

      {/* Dark charcoal background circle */}
      <circle cx="250" cy="250" r="232" fill="url(#chLogoMatteBg)" />

      {/* Outer concentric orbital swirl rings in signature warm amber gold */}
      <g fill="none" stroke="url(#chAmberGoldGrad)" strokeLinecap="round" opacity="0.95">
        <path d="M 95 240 A 155 155 0 1 0 395 265" strokeWidth="2.2" />
        <path d="M 100 248 A 150 150 0 1 0 390 272" strokeWidth="2.6" />
        <path d="M 106 256 A 144 144 0 1 0 384 280" strokeWidth="2.8" />
        <path d="M 112 264 A 138 138 0 1 0 378 288" strokeWidth="3" />
        <path d="M 118 272 A 132 132 0 1 0 372 296" strokeWidth="2.8" />
        <path d="M 125 280 A 126 126 0 1 0 365 304" strokeWidth="2.4" />
        <path d="M 132 288 A 120 120 0 1 0 358 312" strokeWidth="1.8" />
        
        {/* Top-left counter swirl arcs */}
        <path d="M 160 135 A 150 150 0 0 1 350 155" strokeWidth="1.8" strokeDasharray="130 20" />
        <path d="M 152 142 A 144 144 0 0 1 342 162" strokeWidth="2.2" strokeDasharray="110 25" />
        <path d="M 145 150 A 138 138 0 0 1 334 170" strokeWidth="2.0" />
      </g>

      {/* Mountain Cottage Villa Silhouette */}
      <g stroke="url(#chAmberGoldGrad)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left chimney */}
        <path d="M 175 228 V 208 H 188 V 218" strokeWidth="5" />
        {/* Left main roof slope */}
        <path d="M 156 242 L 214 203" strokeWidth="5.5" />
        {/* Primary right roof slope */}
        <path d="M 214 203 L 274 242" strokeWidth="5.5" />
        {/* Secondary overlapping right ridge line */}
        <path d="M 228 203 L 296 242" strokeWidth="5.5" />
      </g>

      {/* 4 circular window lights in 2x2 grid in warm gold */}
      <g fill="url(#chAmberGoldGrad)">
        <circle cx="210" cy="223" r="5.5" />
        <circle cx="226" cy="223" r="5.5" />
        <circle cx="210" cy="239" r="5.5" />
        <circle cx="226" cy="239" r="5.5" />
      </g>

      {/* Embedded text for badge or standalone icon view */}
      {variant !== 'horizontal' && (
        <>
          <text
            x="250"
            y="266"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="800"
            fontSize="21"
            letterSpacing="2.5"
          >
            CLOUD HEAVEN
          </text>
          <text
            x="250"
            y="287"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="600"
            fontSize="12.5"
            letterSpacing="6.5"
          >
            RESORT
          </text>
        </>
      )}
    </svg>
  );

  if (variant === 'icon' || variant === 'badge') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {EmblemSvg}
      </div>
    );
  }

  // Horizontal layout: Emblem on left + crisp typography on right
  const isDark = mode === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {EmblemSvg}
      <div className="flex flex-col text-left leading-none">
        <span
          className={`font-sans font-extrabold uppercase tracking-wider text-base sm:text-lg transition-colors ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          CLOUD HEAVEN
        </span>
        <span
          className={`font-sans font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.3em] mt-1 ${
            isDark ? 'text-amber-400' : 'text-amber-700'
          }`}
        >
          RESORT &bull; VAGAMON
        </span>
      </div>
    </div>
  );
};
