/**
 * Rotating Globe Loader
 * Beige-gold rotating earth animation for loading states
 */

'use client';

export function GlobeLoader({ text = "Analyzing job description and selecting best content..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1614] to-[#0a0a0a]">
      <div className="text-center">
        {/* Rotating Globe */}
        <div className="relative w-64 h-64 mx-auto mb-12">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#D4AF67]/30 via-[#D4AF67]/10 to-transparent animate-pulse-slow" />

          {/* Main globe */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#2a2520] to-[#0f0f0f] border border-[#D4AF67]/20 overflow-hidden globe-shadow">
            {/* Rotating shine effect */}
            <div className="absolute inset-0 animate-globe-rotate">
              {/* Latitude lines */}
              <div className="absolute top-1/4 left-0 right-0 h-px bg-[#D4AF67]/20" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#D4AF67]/30" />
              <div className="absolute top-3/4 left-0 right-0 h-px bg-[#D4AF67]/20" />

              {/* Longitude curves - vertical */}
              <div className="absolute top-0 bottom-0 left-1/4 w-px bg-[#D4AF67]/20" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#D4AF67]/30" />
              <div className="absolute top-0 bottom-0 left-3/4 w-px bg-[#D4AF67]/20" />
            </div>

            {/* Continents - Abstract pixelated landmasses */}
            <div className="absolute top-1/3 left-1/4 w-8 h-6 opacity-60">
              <div className="absolute top-0 left-2 w-5 h-2 bg-[#D4AF67]" />
              <div className="absolute top-2 left-0 w-7 h-3 bg-[#D4AF67]" />
              <div className="absolute top-4 left-3 w-4 h-1 bg-[#D4AF67]" />
            </div>

            <div className="absolute top-1/2 right-1/4 w-10 h-8 opacity-50">
              <div className="absolute top-0 left-0 w-8 h-2 bg-[#D4AF67]" />
              <div className="absolute top-1 left-2 w-6 h-3 bg-[#D4AF67]" />
              <div className="absolute top-4 left-1 w-5 h-2 bg-[#D4AF67]" />
              <div className="absolute top-5 left-4 w-3 h-2 bg-[#D4AF67]" />
            </div>

            {/* Top hemisphere glow */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#D4AF67]/30 to-transparent" />

            {/* Bottom shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Rotating light reflection */}
            <div className="absolute top-8 right-8 w-16 h-32 bg-gradient-to-br from-[#D4AF67]/40 to-transparent rounded-full blur-xl animate-globe-shine" />
          </div>

          {/* Orbit ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF67]/10 animate-orbit-ring" />
        </div>

        {/* Loading Text */}
        <p className="text-[#D4AF67] text-xl font-medium mb-8 animate-pulse-text">{text}</p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="h-1 bg-[#2a2520] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4AF67] to-[#C9A86A] animate-progress-fill" />
          </div>
          <p className="text-[#D4AF67]/60 text-sm mt-3 font-mono tracking-wider">PROCESSING...</p>
        </div>
      </div>
    </div>
  );
}
