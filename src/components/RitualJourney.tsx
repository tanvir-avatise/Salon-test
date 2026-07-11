import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import { JOURNEY } from "../lib/content";
import { asset } from "../lib/asset";
import "./RitualJourney.css";

/**
 * The Ritual Journey — a scroll-scrubbed passage through the five service
 * steps. A full-viewport sticky stage holds a slender glowing "spine" that
 * rotates and advances as you scroll; the journey images are threaded along
 * it, coming into focus one at a time with their caption. A single scroll
 * progress (0 → 1 across a tall container) drives the active step, the
 * cross-fade/scale, the spine rotation and a subtle parallax.
 *
 * Under reduced motion it falls back to a calm stacked sequence.
 */
export default function RitualJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduced] = useState(() => prefersReducedMotion());

  const n = JOURNEY.length;

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    let raf = 0;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));

      // intro head fades out as the journey starts
      if (headRef.current) {
        const h = Math.min(1, Math.max(0, (0.06 - p) / 0.06));
        headRef.current.style.opacity = String(h);
        headRef.current.style.transform = `translateY(${(1 - h) * -20}px)`;
      }

      // which step is active (0 .. n-1)
      const activeF = p * (n - 1);
      const active = Math.round(activeF);
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = activeF - i;
        const near = Math.max(0, 1 - Math.abs(d));
        const opacity = Math.max(0, 1 - Math.abs(d) * 1.5);
        const scale = 0.84 + near * 0.16;
        // slide from the step's side + a little parallax with scroll distance
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (1 - near) * 8; // vw, eases toward centre when active
        const y = d * 26; // px parallax
        el.style.opacity = String(opacity);
        el.style.transform = `translate(-50%, -50%) translate(${x}vw, ${y}px) scale(${scale})`;
        el.style.zIndex = String(near > 0.5 ? 3 : 2);
        el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      });

      // spine: rotate through 3D + travelling orb + active node
      if (spineRef.current) spineRef.current.style.transform = `rotateY(${-20 + p * 40}deg) rotateZ(${(p - 0.5) * 4}deg)`;
      if (orbRef.current) orbRef.current.style.top = `${8 + p * 84}%`;
      nodeRefs.current.forEach((nd, i) => {
        if (nd) nd.classList.toggle("is-active", i === active);
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, n]);

  const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.opacity = "0";
  };

  /* ---------- reduced-motion: stacked sequence ---------- */
  if (reduced) {
    return (
      <section id="journey" className="rj-static section" aria-label="The Ritual Journey">
        <div className="section-inner">
          <span className="eyebrow">The Ritual Journey</span>
          <h2 className="section-title">Five steps, one transformation.</h2>
          <ol className="rj-static__list">
            {JOURNEY.map((s) => (
              <li key={s.index}>
                <div className="rj-static__media">
                  <img src={asset(`images/${s.img}`)} alt={`${s.title} — ${s.line}`} loading="lazy" onError={hide} />
                </div>
                <div className="rj-static__copy">
                  <span className="rj-index">{s.index} / {s.title}</span>
                  <p className="rj-line">{s.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  /* ---------- motion: scroll-scrubbed spine ---------- */
  return (
    <section
      id="journey"
      ref={sectionRef}
      className="rj"
      aria-label="The Ritual Journey"
      style={{ height: `${100 + n * 80}vh` }}
    >
      <div className="rj-sticky">
        <div ref={headRef} className="rj-head">
          <span className="eyebrow">The Ritual Journey</span>
          <h2 className="section-title">Five steps,<br />one transformation.</h2>
          <span className="rj-head-cue">Scroll the journey</span>
        </div>

        <div className="rj-stage">
          {/* glowing spine */}
          <div className="rj-spine-wrap" aria-hidden="true">
            <div ref={spineRef} className="rj-spine">
              <span className="rj-rail" />
              {JOURNEY.map((s, i) => (
                <span
                  key={s.index}
                  ref={(el) => (nodeRefs.current[i] = el)}
                  className="rj-node"
                  style={{ top: `${8 + (i / (n - 1)) * 84}%` }}
                >
                  <i className="rj-node-dot" />
                  <em className="rj-node-num">{s.index}</em>
                </span>
              ))}
              <span ref={orbRef} className="rj-orb" />
            </div>
          </div>

          {/* threaded step cards */}
          {JOURNEY.map((s, i) => (
            <div
              key={s.index}
              ref={(el) => (stepRefs.current[i] = el)}
              className={`rj-step rj-step--${i % 2 === 0 ? "left" : "right"}`}
            >
              <figure className="rj-card">
                <img
                  src={asset(`images/${s.img}`)}
                  alt={`${s.title} — ${s.line}`}
                  loading="lazy"
                  decoding="async"
                  onError={hide}
                />
                <span className="rj-card-glow" aria-hidden="true" />
              </figure>
              <div className="rj-caption">
                <span className="rj-index">
                  {s.index} <em>/</em> {s.title}
                </span>
                <p className="rj-line serif-display">{s.line}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rj-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
    </section>
  );
}
