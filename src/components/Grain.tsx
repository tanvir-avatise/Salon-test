import "./Grain.css";

/**
 * Subtle film grain laid over the whole page. Pure SVG fractal noise as a
 * data-URI background — no image asset required. Animated by CSS steps for a
 * gentle "living" texture; frozen under prefers-reduced-motion.
 */
export default function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
