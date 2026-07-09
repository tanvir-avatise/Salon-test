import "./MapEmbed.css";

/**
 * A stylised, self-contained map — an abstract street grid with a pulsing
 * marker over the atelier, themed to the palette. Kept asset-free and free of
 * external embeds so it never breaks; a "Get directions" link hands off to the
 * visitor's map app of choice.
 */
export default function MapEmbed({
  query,
  label,
}: {
  query: string;
  label: string;
}) {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  // A few deterministic "streets" for the abstract grid.
  const streets = [
    "M0 120 H520",
    "M0 250 H520",
    "M0 360 H520",
    "M120 0 V440",
    "M300 0 V440",
    "M420 0 V440",
    "M0 60 L200 200 L520 180",
    "M60 440 L240 300 L520 340",
  ];

  return (
    <div className="mapembed">
      <svg viewBox="0 0 520 440" width="100%" height="100%" role="img" aria-label={label}>
        <defs>
          <radialGradient id="map-vin" cx="52%" cy="46%" r="62%">
            <stop offset="0%" stopColor="#2a2024" stopOpacity="0" />
            <stop offset="100%" stopColor="#171215" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <rect width="520" height="440" fill="#211a1d" />
        <g stroke="#3a2f34" strokeWidth="2" fill="none">
          {streets.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g stroke="#4a3a3f" strokeWidth="6" fill="none" opacity="0.6">
          <path d="M120 0 V440" />
          <path d="M0 250 H520" />
        </g>
        {/* blocks */}
        <g fill="#251d20">
          <rect x="140" y="140" width="140" height="90" rx="3" />
          <rect x="320" y="140" width="80" height="90" rx="3" />
          <rect x="140" y="270" width="140" height="70" rx="3" />
          <rect x="320" y="270" width="80" height="70" rx="3" />
        </g>
        <rect width="520" height="440" fill="url(#map-vin)" />
        {/* marker */}
        <g transform="translate(300, 250)">
          <circle r="34" fill="#c99a8a" opacity="0.12">
            <animate attributeName="r" values="18;40;18" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="3.2s" repeatCount="indefinite" />
          </circle>
          <path
            d="M0 -22 C 12 -22 20 -13 20 -2 C 20 12 0 24 0 24 C 0 24 -20 12 -20 -2 C -20 -13 -12 -22 0 -22 Z"
            fill="#c99a8a"
          />
          <circle cy="-2" r="6.5" fill="#211a1d" />
        </g>
      </svg>
      <a
        className="mapembed__cta"
        href={directions}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get directions ↗
      </a>
    </div>
  );
}
