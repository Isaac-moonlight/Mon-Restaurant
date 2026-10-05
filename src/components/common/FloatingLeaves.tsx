import React from 'react';

export const FloatingLeaves: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Top right floating sage/basil leaf */}
      <div className="absolute -top-4 -right-2 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 opacity-75 animate-float-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-600/70 drop-shadow-md">
          <path d="M50 10 C20 30 10 70 50 90 C90 70 80 30 50 10 Z" />
          <path d="M50 10 Q50 50 50 90" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
          <path d="M50 35 Q35 45 25 50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M50 55 Q65 65 75 70" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Mid left drifting mint leaf */}
      <div className="absolute top-1/3 -left-4 sm:left-6 w-12 h-12 sm:w-16 sm:h-16 opacity-60 animate-float-gentle [animation-delay:2s]">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/65 rotate-45 drop-shadow-sm">
          <path d="M50 15 C25 35 15 65 50 85 C85 65 75 35 50 15 Z" />
          <path d="M50 15 Q50 50 50 85" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Bottom right floating herb leaf */}
      <div className="absolute bottom-28 -right-3 sm:right-8 w-14 h-14 opacity-50 animate-float-slow [animation-delay:4s]">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-700/60 -rotate-12 drop-shadow-md">
          <path d="M50 10 C20 30 10 70 50 90 C90 70 80 30 50 10 Z" />
          <path d="M50 10 Q50 50 50 90" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
        </svg>
      </div>
    </div>
  );
};
