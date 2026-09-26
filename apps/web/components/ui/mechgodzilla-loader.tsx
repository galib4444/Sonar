/**
 * Pixelated MechGodzilla Loader
 * Chrome Dino game style animation for loading states
 */

'use client';

export function MechGodzillaLoader() {
  return (
    <div className="relative w-full h-32 overflow-hidden bg-gradient-to-b from-[#E5D4B5]/50 to-[#E5D4B5]/30 rounded-xl">
      {/* Clouds - Background Layer */}
      <div className="absolute top-4 left-0 w-full h-16">
        <div className="absolute top-2 left-[10%] animate-cloud-slow">
          <div className="relative">
            <div className="absolute w-8 h-2 bg-gray-400/40" />
            <div className="absolute top-1 left-2 w-12 h-2 bg-gray-400/40" />
            <div className="absolute top-2 left-1 w-10 h-2 bg-gray-400/40" />
          </div>
        </div>
        <div className="absolute top-6 left-[60%] animate-cloud-fast">
          <div className="relative">
            <div className="absolute w-6 h-2 bg-gray-400/40" />
            <div className="absolute top-1 left-1 w-10 h-2 bg-gray-400/40" />
            <div className="absolute top-2 left-2 w-6 h-2 bg-gray-400/40" />
          </div>
        </div>
      </div>

      {/* Ground Line */}
      <div className="absolute bottom-8 left-0 w-full h-0.5 bg-gray-600" />

      {/* Cacti - Obstacles */}
      <div className="absolute bottom-8 left-0 w-full h-16">
        <div className="absolute bottom-0 left-[30%] animate-obstacle">
          <div className="relative">
            {/* Cactus body */}
            <div className="absolute bottom-0 left-2 w-2 h-8 bg-gray-700" />
            {/* Left arm */}
            <div className="absolute bottom-4 left-0 w-2 h-1 bg-gray-700" />
            <div className="absolute bottom-5 left-0 w-1 h-3 bg-gray-700" />
            {/* Right arm */}
            <div className="absolute bottom-3 left-4 w-2 h-1 bg-gray-700" />
            <div className="absolute bottom-4 left-5 w-1 h-4 bg-gray-700" />
          </div>
        </div>
        <div className="absolute bottom-0 left-[70%] animate-obstacle-slow">
          <div className="relative">
            {/* Smaller cactus */}
            <div className="absolute bottom-0 left-1 w-2 h-6 bg-gray-700" />
            <div className="absolute bottom-3 left-3 w-1 h-2 bg-gray-700" />
          </div>
        </div>
      </div>

      {/* MechGodzilla - Running horizontally (Side Profile) */}
      <div
        className="absolute bottom-8 w-20 h-20"
        style={{ animation: 'mechgodzilla-horizontal-run 3s linear infinite, mechgodzilla-bounce 0.4s ease-in-out infinite' }}
      >
        {/* MechGodzilla Body - Pixelated Side View (Chrome Dino Style) */}
        <div className="absolute inset-0">
          {/* Head - Side Profile */}
          <div className="absolute top-2 left-12 w-5 h-4 bg-black" />
          {/* Snout */}
          <div className="absolute top-3 left-16 w-2 h-2 bg-black" />
          {/* Eye - Red accent */}
          <div className="absolute top-2 left-14 w-1 h-1 bg-red-600" />

          {/* Dorsal Plates - Iconic Spikes */}
          <div className="absolute top-0 left-8 w-1 h-3 bg-black" />
          <div className="absolute top-0 left-10 w-1 h-4 bg-black" />
          <div className="absolute top-1 left-6 w-1 h-3 bg-black" />
          <div className="absolute top-2 left-4 w-1 h-2 bg-black" />

          {/* Neck */}
          <div className="absolute top-5 left-11 w-3 h-2 bg-black" />

          {/* Body - Main torso */}
          <div className="absolute top-6 left-6 w-8 h-6 bg-black" />
          {/* Chest detail - Red accent */}
          <div className="absolute top-8 left-8 w-4 h-2 bg-red-900/60" />

          {/* Tail - Long and curved */}
          <div className="absolute top-8 left-1 w-6 h-2 bg-black" />
          <div className="absolute top-9 left-0 w-4 h-1 bg-black" />

          {/* Front Leg (visible) */}
          <div
            className="absolute top-12 left-11 w-2 h-5 bg-black"
            style={{ animation: 'leg-front 0.3s ease-in-out infinite' }}
          />
          <div
            className="absolute top-16 left-11 w-3 h-1 bg-black"
            style={{ animation: 'leg-front 0.3s ease-in-out infinite' }}
          />

          {/* Back Leg (visible) */}
          <div
            className="absolute top-12 left-7 w-2 h-5 bg-black"
            style={{ animation: 'leg-back 0.3s ease-in-out infinite' }}
          />
          <div
            className="absolute top-16 left-7 w-3 h-1 bg-black"
            style={{ animation: 'leg-back 0.3s ease-in-out infinite' }}
          />

          {/* Front Arm */}
          <div className="absolute top-8 left-13 w-1 h-3 bg-black" />
          <div className="absolute top-10 left-13 w-2 h-1 bg-black" />

          {/* Mechanical Red Accents */}
          <div className="absolute top-7 left-9 w-1 h-1 bg-red-600" />
          <div className="absolute top-9 left-11 w-1 h-1 bg-red-600" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute top-3 right-4 text-gray-700 font-mono text-sm font-medium">
        LOADING...
      </div>
    </div>
  );
}
