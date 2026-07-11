import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import { asset } from "../lib/asset";
import "./MotionMoment.css";

const HAIR = asset("images/hero-hair.jpg");

/**
 * A cinematic "in motion" interstitial — a scroll-scrubbed moment that plays
 * like a few seconds of glossy hair B-roll without shipping a video file. A
 * tall sticky section turns scroll into a playhead (0 → 1): the framing slowly
 * pushes in and pans, a band of light sweeps across the strands, and a single
 * line resolves into place. Pure transforms + opacity, so it stays smooth.
 *
 * Under reduced motion it settles to a calm, static frame.
 */
export default function MotionMoment() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [reduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    let raf = 0;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));

      // slow push-in + pan — the "camera" drifting over the hair
      if (mediaRef.current) {
        const scale = 1.18 - p * 0.16;
        const shiftY = (p - 0.5) * 10; // %
        const bright = 0.62 + Math.sin(p * Math.PI) * 0.24;
        mediaRef.current.style.transform = `scale(${scale}) translate3d(0, ${shiftY}%, 0)`;
        mediaRef.current.style.filter = `brightness(${bright}) saturate(1.08)`;
      }
      // a band of light travelling across the strands
      if (sheenRef.current) {
        sheenRef.current.style.transform = `translateX(${-70 + p * 240}%) rotate(18deg)`;
        sheenRef.current.style.opacity = String(Math.sin(p * Math.PI) * 0.7);
      }
      // the line resolves in over the first half, holds, drifts on exit
      if (copyRef.current) {
        const inP = Math.min(1, p / 0.42);
        const outP = Math.max(0, (p - 0.82) / 0.18);
        const op = Math.max(0, inP - outP);
        copyRef.current.style.opacity = String(op);
        copyRef.current.style.transform = `translateY(${(1 - inP) * 26 + outP * -24}px)`;
        copyRef.current.style.letterSpacing = `${0.14 - inP * 0.1}em`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.opacity = "0";
  };

  if (reduced) {
    return (
      <section className="mm mm--static" aria-label="In motion">
        <div className="mm-media mm-media--static">
          <img src={HAIR} alt="" onError={hide} />
        </div>
        <div className="mm-copy">
          <span className="mm-kicker">In motion</span>
          <p className="mm-line serif-display">Every strand, alive with light.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="mm" aria-label="In motion">
      <div className="mm-sticky">
        <div ref={mediaRef} className="mm-media">
          <img src={HAIR} alt="" onError={hide} />
        </div>
        <span ref={sheenRef} className="mm-sheen" aria-hidden="true" />
        <span className="mm-vignette" aria-hidden="true" />
        <div ref={copyRef} className="mm-copy">
          <span className="mm-kicker">In motion</span>
          <p className="mm-line serif-display">Every strand, alive with light.</p>
        </div>
        <div className="mm-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
    </section>
  );
}
