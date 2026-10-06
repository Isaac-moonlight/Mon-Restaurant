import React from 'react';

interface RestaurantLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'full';
  isDark?: boolean;
}

export const RestaurantLogo: React.FC<RestaurantLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'emblem',
  isDark = false,
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', svg: 32 },
    md: { box: 'w-11 h-11', svg: 44 },
    lg: { box: 'w-16 h-16', svg: 64 },
    xl: { box: 'w-20 h-20', svg: 80 },
  };

  const { box, svg } = sizeMap[size];

  return (
    <div className={`relative flex items-center gap-3 select-none ${className}`}>
      {/* Real Gastronomic Vector Emblem */}
      <div className={`relative ${box} shrink-0 flex items-center justify-center rounded-2xl shadow-md transition-all ${
        isDark ? 'bg-gradient-to-br from-[#1c2230] to-[#121622] ring-1 ring-amber-400/40' : 'bg-gradient-to-br from-[#241f19] to-[#14120e] ring-1 ring-amber-300/50'
      }`}>
        <svg
          viewBox="0 0 100 100"
          className="w-[82%] h-[82%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="silverCutlery" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* Laurel Wreath Left */}
          <path
            d="M 28 68 C 20 54 22 36 34 26 C 32 32 32 42 36 50 C 32 56 30 62 28 68 Z"
            fill="url(#goldLuxury)"
            opacity="0.85"
          />
          {/* Laurel Wreath Right */}
          <path
            d="M 72 68 C 80 54 78 36 66 26 C 68 32 68 42 64 50 C 68 56 70 62 72 68 Z"
            fill="url(#goldLuxury)"
            opacity="0.85"
          />

          {/* Three Stars at the top */}
          <polygon points="50,13 52,17 56,17 53,20 54,24 50,22 46,24 47,20 44,17 48,17" fill="url(#goldLuxury)" />
          <polygon points="38,18 39,21 42,21 40,23 41,26 38,24 35,26 36,23 34,21 37,21" fill="url(#goldLuxury)" opacity="0.9" />
          <polygon points="62,18 63,21 66,21 64,23 65,26 62,24 59,26 60,23 58,21 61,21" fill="url(#goldLuxury)" opacity="0.9" />

          {/* Gastronomic Cloche (Dome) */}
          <path
            d="M 32 54 C 32 40 40 32 50 32 C 60 32 68 40 68 54 Z"
            fill="url(#goldLuxury)"
          />
          {/* Cloche Knob */}
          <circle cx="50" cy="30" r="3" fill="url(#goldLuxury)" />
          
          {/* Cloche Base Rim */}
          <rect x="28" y="55" width="44" height="4" rx="2" fill="url(#goldLuxury)" />

          {/* Crossed Fine Cutlery (Fork & Knife under cloche) */}
          {/* Fork */}
          <path
            d="M 36 64 L 62 82 M 38 62 L 42 66 M 34 66 L 38 70"
            stroke="url(#silverCutlery)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Knife */}
          <path
            d="M 64 64 L 38 82 M 64 64 C 62 67 60 70 58 72"
            stroke="url(#silverCutlery)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Subtle cloche highlight shine */}
          <path
            d="M 40 40 C 44 36 48 35 52 35"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Optional full wordmark */}
      {variant === 'full' && (
        <div className="leading-tight text-left">
          <div className={`font-serif-luxury text-base sm:text-lg font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            DineFlow Pro
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
            Haute Gastronomie & Service
          </div>
        </div>
      )}
    </div>
  );
};
