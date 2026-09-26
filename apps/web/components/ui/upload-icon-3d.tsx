/**
 * 3D Animated Upload Icon - Solar System
 * Animated solar system with sun and orbiting planets
 */

'use client';

export function UploadIcon3D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <style jsx>{`
        @keyframes rotate-orbit-1 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-orbit-2 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-orbit-3 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes sun-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1.2);
          }
          50% {
            transform: scale(1.08);
            filter: brightness(1.5);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }

        .orbit-1 {
          animation: rotate-orbit-1 10s linear infinite;
        }

        .orbit-2 {
          animation: rotate-orbit-2 16s linear infinite;
        }

        .orbit-3 {
          animation: rotate-orbit-3 24s linear infinite;
        }

        .sun-glow {
          animation: sun-pulse 3s ease-in-out infinite;
        }

        .outer-glow {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-28 h-28">
        <svg
          width="112"
          height="112"
          viewBox="0 0 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sun gradient - Realistic warm golden tones */}
            <radialGradient id="sunGradient">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="30%" stopColor="#DAA520" />
              <stop offset="70%" stopColor="#CD853F" />
              <stop offset="100%" stopColor="#B8860B" />
            </radialGradient>

            {/* Outer glow - Subtle golden aura */}
            <radialGradient id="outerGlow">
              <stop offset="0%" stopColor="#DAA520" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#CD853F" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
            </radialGradient>

            {/* Orbit ring gradient */}
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A86A" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#DAA520" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C9A86A" stopOpacity="0.3" />
            </linearGradient>

            {/* Mercury - Dusty gray/beige */}
            <radialGradient id="planet1Gradient">
              <stop offset="0%" stopColor="#B0A090" />
              <stop offset="100%" stopColor="#8B7D6B" />
            </radialGradient>

            {/* Mars - Dusty terracotta/rust */}
            <radialGradient id="planet2Gradient">
              <stop offset="0%" stopColor="#C17B5C" />
              <stop offset="100%" stopColor="#A66B4F" />
            </radialGradient>

            {/* Earth - Muted blue-green */}
            <radialGradient id="planet3Gradient">
              <stop offset="0%" stopColor="#7B9FA3" />
              <stop offset="100%" stopColor="#5F8A8B" />
            </radialGradient>

            {/* Venus - Pale gold/cream */}
            <radialGradient id="planet4Gradient">
              <stop offset="0%" stopColor="#E5D4B5" />
              <stop offset="100%" stopColor="#D9C5A0" />
            </radialGradient>

            {/* Jupiter - Warm tan/brown */}
            <radialGradient id="planet5Gradient">
              <stop offset="0%" stopColor="#C9A86A" />
              <stop offset="100%" stopColor="#B8956D" />
            </radialGradient>

            {/* Saturn - Pale cream/buff */}
            <radialGradient id="planet6Gradient">
              <stop offset="0%" stopColor="#E0D5BE" />
              <stop offset="100%" stopColor="#D4C5A8" />
            </radialGradient>
          </defs>

          {/* Background glow */}
          <circle
            cx="56"
            cy="56"
            r="50"
            fill="url(#outerGlow)"
            className="outer-glow"
          />

          {/* Orbit Ring 1 */}
          <circle
            cx="56"
            cy="56"
            r="28"
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="1"
            opacity="0.4"
            strokeDasharray="2 4"
          />

          {/* Orbit Ring 2 */}
          <circle
            cx="56"
            cy="56"
            r="38"
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="1"
            opacity="0.4"
            strokeDasharray="2 4"
          />

          {/* Orbit Ring 3 */}
          <circle
            cx="56"
            cy="56"
            r="46"
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="1"
            opacity="0.4"
            strokeDasharray="2 4"
          />

          {/* Planet 1 on Orbit 1 (Blue) */}
          <circle
            r="4"
            fill="url(#planet1Gradient)"
            filter="drop-shadow(0 0 3px rgba(135, 206, 235, 0.8))"
          >
            <animateMotion
              dur="10s"
              repeatCount="indefinite"
              path="M56,28 a28,28 0 1,1 0,56 a28,28 0 1,1 0,-56"
            />
          </circle>

          {/* Planet 2 on Orbit 1 (Green - opposite side) */}
          <circle
            r="3"
            fill="url(#planet3Gradient)"
            filter="drop-shadow(0 0 2px rgba(50, 205, 50, 0.7))"
          >
            <animateMotion
              dur="10s"
              repeatCount="indefinite"
              begin="5s"
              path="M56,28 a28,28 0 1,1 0,56 a28,28 0 1,1 0,-56"
            />
          </circle>

          {/* Planet 3 on Orbit 2 (Red) */}
          <circle
            r="5"
            fill="url(#planet2Gradient)"
            filter="drop-shadow(0 0 4px rgba(255, 99, 71, 0.8))"
          >
            <animateMotion
              dur="16s"
              repeatCount="indefinite"
              path="M56,18 a38,38 0 1,1 0,76 a38,38 0 1,1 0,-76"
            />
          </circle>

          {/* Planet 4 on Orbit 2 (Pink - offset) */}
          <circle
            r="3.5"
            fill="url(#planet4Gradient)"
            filter="drop-shadow(0 0 2px rgba(255, 105, 180, 0.7))"
          >
            <animateMotion
              dur="16s"
              repeatCount="indefinite"
              begin="5.3s"
              path="M56,18 a38,38 0 1,1 0,76 a38,38 0 1,1 0,-76"
            />
          </circle>

          {/* Planet 5 on Orbit 3 (Green) */}
          <circle
            r="4.5"
            fill="url(#planet3Gradient)"
            filter="drop-shadow(0 0 3px rgba(50, 205, 50, 0.8))"
          >
            <animateMotion
              dur="24s"
              repeatCount="indefinite"
              path="M56,10 a46,46 0 1,1 0,92 a46,46 0 1,1 0,-92"
            />
          </circle>

          {/* Planet 6 on Orbit 3 (Blue - offset) */}
          <circle
            r="3"
            fill="url(#planet1Gradient)"
            filter="drop-shadow(0 0 2px rgba(135, 206, 235, 0.6))"
          >
            <animateMotion
              dur="24s"
              repeatCount="indefinite"
              begin="16s"
              path="M56,10 a46,46 0 1,1 0,92 a46,46 0 1,1 0,-92"
            />
          </circle>

          {/* Central Sun */}
          <circle
            cx="56"
            cy="56"
            r="16"
            fill="url(#sunGradient)"
            filter="drop-shadow(0 0 15px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 25px rgba(255, 165, 0, 0.6))"
            className="sun-glow"
          />

          {/* Sun highlight */}
          <circle
            cx="52"
            cy="52"
            r="6"
            fill="rgba(255, 255, 255, 0.6)"
            filter="blur(2px)"
          />
        </svg>
      </div>
    </div>
  );
}
