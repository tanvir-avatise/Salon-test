import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import { asset } from "../lib/asset";
import "./MotionMoment.css";

const MotionCanvas = lazy(() => import("./three/MotionCanvas"));
const HAIR = asset("images/hero-hair.jpg");

/**
 * "In motion" — the cinematic breath between the transformation reveal and the
 * services. A tall sticky section turns scroll into a playhead (0 → 1) that
 * drives a live WebGL treatment of the hair (a slow push-in, a flowing
 * shimmer, and bands of light travelling down the strands — see MotionCanvas),
 * while two Cormorant lines resolve in turn. The canvas only mounts while the
 * section is near the viewport, so it costs nothing elsewhere.
 *
 * Under reduced motion it settles to a calm, static frame.
 */
export default function MotionMoment() {
  const sectionRef = useRef<HTMLElement>(null);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const [reduced] = useState(() => prefersReducedMotion());
  const [inView, setInView] = useState(false);

  // Mount the WebGL only while the section is near the viewport.
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "40% 0px 40% 0px" }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    let raf = 0;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      progressRef.current = p;

      // two staged lines: the first resolves in and hands off to the second
      const stage = (el: HTMLDivElement | null, inA: number, inB: number, outA: number, outB: number) => {
        if (!el) return;
        const inP = Math.min(1, Math.max(0, (p - inA) / (inB - inA)));
        const outP = Math.min(1, Math.max(0, (p - outA) / (outB - outA)));
        const op = Math.max(0, inP - outP);
        el.style.opacity = String(op);
        el.style.transform = `translateY(${(1 - inP) * 26 + outP * -24}px)`;
        el.style.letterSpacing = `${0.14 - inP * 0.1}em`;
      };
      stage(beat1Ref.current, 0.0, 0.34, 0.44, 0.6);
      stage(beat2Ref.current, 0.54, 0.82, 0.92, 1.0);
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
        <div className="mm-copy mm-copy--static">
          <span className="mm-kicker">In motion</span>
          <p className="mm-line serif-display">Every strand, alive with light.</p>
          <p className="mm-line serif-display">Movement is the finishing touch.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="mm" aria-label="In motion">
      <div className="mm-sticky">
        <div className="mm-canvas">
          {inView && (
            <Suspense fallback={null}>
              <MotionCanvas progressRef={progressRef} />
            </Suspense>
          )}
        </div>
        <span className="mm-vignette" aria-hidden="true" />
        <div className="mm-copy">
          <div ref={beat1Ref} className="mm-beat">
            <span className="mm-kicker">In motion</span>
            <p className="mm-line serif-display">Every strand, alive with light.</p>
          </div>
          <div ref={beat2Ref} className="mm-beat">
            <p className="mm-line serif-display">Movement is the finishing touch.</p>
          </div>
        </div>
        <div className="mm-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
    </section>
  );
}
