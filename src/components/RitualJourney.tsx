import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { isTouch, prefersReducedMotion } from "../lib/motion";
import { JOURNEY } from "../lib/content";
import { asset } from "../lib/asset";
import "./RitualJourney.css";

const JourneySpine = lazy(() => import("./three/JourneySpine"));

/**
 * The Ritual Journey — a scroll-scrubbed passage through the five service
 * steps, rendered as a true 3D threaded backbone (React-Three-Fiber). A tall
 * sticky container drives a single scroll progress (0 → 1); that value is
 * shared by ref with the WebGL scene, where a luminous rose-gold strand
 * rotates and the five journey photos — bent onto curved planes — are threaded
 * along it, each coming forward into focus in turn with its own caption.
 *
 * An HTML overlay carries the intro heading, the numbered node markers and the
 * progress bar, all synced to the active station. Under reduced motion (or on
 * touch, where WebGL is costly) it falls back to a calm stacked sequence.
 */
export default function RitualJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef<(HTMLLIElement | null)[]>([]);
  const progressRef = useRef(0);
  const [reduced] = useState(() => prefersReducedMotion() || isTouch());

  const n = JOURNEY.length;

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    let raf = 0;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      progressRef.current = p;

      // intro head fades out as the journey starts
      if (headRef.current) {
        const h = Math.min(1, Math.max(0, (0.07 - p) / 0.07));
        headRef.current.style.opacity = String(h);
        headRef.current.style.transform = `translate(-50%, ${(1 - h) * -20}px)`;
      }

      // which station is active (0 .. n-1)
      const active = Math.round(p * (n - 1));
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

  /* ---------- reduced-motion / touch: stacked sequence ---------- */
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

  /* ---------- motion: 3D threaded backbone ---------- */
  return (
    <section
      id="journey"
      ref={sectionRef}
      className="rj"
      aria-label="The Ritual Journey"
      style={{ height: `${100 + n * 90}vh` }}
    >
      <div className="rj-sticky">
        {/* the WebGL backbone fills the stage */}
        <div className="rj-canvas">
          <Suspense fallback={null}>
            <JourneySpine progressRef={progressRef} />
          </Suspense>
        </div>

        {/* intro heading, fades as the journey begins */}
        <div ref={headRef} className="rj-head">
          <span className="eyebrow">The Ritual Journey</span>
          <h2 className="section-title">Five steps,<br />one transformation.</h2>
          <span className="rj-head-cue">Scroll the journey</span>
        </div>

        {/* numbered node markers, synced to the active station */}
        <ol className="rj-nodes" aria-hidden="true">
          {JOURNEY.map((s, i) => (
            <li
              key={s.index}
              ref={(el) => (nodeRefs.current[i] = el)}
              className="rj-node"
            >
              <i className="rj-node-dot" />
              <em className="rj-node-num">{s.index}</em>
            </li>
          ))}
        </ol>

        <div className="rj-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
    </section>
  );
}
