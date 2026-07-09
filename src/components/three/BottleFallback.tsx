/**
 * Static, lightweight stand-in for the WebGL bottle — used on touch devices
 * and under prefers-reduced-motion. Pure SVG with a soft rim glow, so it
 * carries the same signature object without a canvas.
 */
export default function BottleFallback() {
  return (
    <div className="bottle-fallback" aria-hidden="true">
      <svg viewBox="0 0 220 420" width="220" height="420" role="presentation">
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#c99a8a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c99a8a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7ece5" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#e7d3c8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c9a99b" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d8a898" />
            <stop offset="100%" stopColor="#b7897a" />
          </linearGradient>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8c3b2" />
            <stop offset="50%" stopColor="#c99a8a" />
            <stop offset="100%" stopColor="#a87a6b" />
          </linearGradient>
        </defs>

        <ellipse cx="110" cy="200" rx="150" ry="180" fill="url(#glow)" />

        {/* body */}
        <path
          d="M62 150 q0 -22 20 -30 l0 -20 q28 -8 56 0 l0 20 q20 8 20 30 l0 180 q0 30 -30 34 q-36 5 -66 0 q-20 -3 -20 -34 z"
          fill="url(#glass)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />
        {/* liquid */}
        <path
          d="M66 250 l88 0 l0 78 q0 26 -26 30 q-30 4 -60 0 q-2 -0.3 -2 -30 z"
          fill="url(#liquid)"
          opacity="0.85"
        />
        {/* highlight */}
        <path d="M80 150 q-8 90 0 190" stroke="rgba(255,255,255,0.5)" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* collar + cap */}
        <rect x="86" y="86" width="48" height="20" rx="4" fill="url(#metal)" />
        <rect x="82" y="44" width="56" height="46" rx="6" fill="url(#metal)" />
        <rect x="80" y="40" width="60" height="8" rx="4" fill="#e8c3b2" />
      </svg>
    </div>
  );
}
