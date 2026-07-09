/**
 * Original, asset-free placeholder imagery. Instead of stock photos we render
 * layered SVG gradients + soft organic shapes that read as abstract salon /
 * portrait / atmosphere frames. Each variant is themed to the palette and
 * can be tinted "before" (raw, cool, dim) or after (warm, radiant).
 */
type Variant = "portrait" | "workspace" | "atmosphere" | "texture" | "service";

const SEED_SHAPES: Record<Variant, string> = {
  portrait: "P",
  workspace: "W",
  atmosphere: "A",
  texture: "T",
  service: "S",
};

export default function PlaceholderImage({
  variant = "texture",
  hue = 0,
  className,
  label,
  mood = "warm",
}: {
  variant?: Variant;
  hue?: number;
  className?: string;
  label?: string;
  mood?: "warm" | "raw";
}) {
  const id = `${SEED_SHAPES[variant]}${hue}`;
  const warm = mood === "warm";
  const c1 = warm ? "#3a2b2b" : "#1c1e22";
  const c2 = warm ? "#c99a8a" : "#5a6a6a";
  const c3 = warm ? "#f2ebe6" : "#8b8f93";

  return (
    <div
      className={className}
      role="img"
      aria-label={label ?? `${variant} imagery`}
      style={{ width: "100%", height: "100%" }}
    >
      <svg
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="60%" stopColor={warm ? "#241b1d" : "#20242a"} />
            <stop offset="100%" stopColor="#14100f" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="42%" cy="34%" r="60%">
            <stop offset="0%" stopColor={c2} stopOpacity={warm ? 0.55 : 0.28} />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </radialGradient>
          <filter id={`soft-${id}`}>
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        <rect width="800" height="1000" fill={`url(#bg-${id})`} />
        <ellipse cx="360" cy="360" rx="360" ry="420" fill={`url(#glow-${id})`} />

        {/* flowing strands / abstract form */}
        <g stroke={c2} strokeOpacity={warm ? 0.5 : 0.28} fill="none" filter={`url(#soft-${id})`}>
          <path d="M180 -40 C 300 300, 180 620, 320 1040" strokeWidth="6" />
          <path d="M420 -60 C 520 260, 380 640, 520 1060" strokeWidth="5" />
          <path d="M620 -40 C 560 320, 700 620, 560 1060" strokeWidth="4" />
        </g>
        <g stroke={c3} strokeOpacity={warm ? 0.35 : 0.2} fill="none">
          <path d="M260 40 C 360 320, 240 640, 380 1000" strokeWidth="1.5" />
          <path d="M500 20 C 470 300, 600 600, 480 1000" strokeWidth="1.5" />
        </g>

        <ellipse cx="470" cy="700" rx="300" ry="260" fill={c2} opacity={warm ? 0.12 : 0.06} filter={`url(#soft-${id})`} />
      </svg>
    </div>
  );
}
