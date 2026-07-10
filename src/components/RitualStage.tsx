import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, isTouch } from "../lib/motion";
import { SALON, RITUAL_BEATS } from "../lib/content";
import { asset } from "../lib/asset";
import SplitLetters from "./SplitLetters";
import "./RitualStage.css";

// Ambient-particle WebGL layer is code-split so touch / reduced-motion
// visitors never download three.js.
const Stage3D = lazy(() => import("./three/Stage3D"));

const HERO_IMG = asset("images/hero-bottle.jpg");
const HERO_ALT =
  "The LUMÉRA signature serum — a frosted-glass bottle with a rose-gold cap, floating in warm light.";

/**
 * Sections 2 + 3 — Hero and The Ritual, sharing one persistent stage.
 *
 * The real signature bottle (hero-bottle.jpg) floats at the centre of a sticky
 * stage, composited over an ambient particle field. A single scroll progress
 * (0 → 1 across the tall stage) drives everything: the hero fades as the ritual
 * beats crossfade, the bottle scales/turns as the "camera" drifts closer, and
 * the backdrop warms from raw dark toward blush.
 *
 * The LUMÉRA wordmark sits clearly ABOVE the bottle so it never competes with
 * the bottle's own engraved label, which is further held low-contrast by a soft
 * scrim.
 *
 * Under reduced motion / touch we drop WebGL and lay everything out calm and
 * static.
 */
export default function RitualStage({ started }: { started: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);

  const [reduced] = useState(() => prefersReducedMotion());
  const [use3D] = useState(() => !prefersReducedMotion() && !isTouch());

  /* Letter-by-letter reveal of the salon name once the preloader lifts. */
  useEffect(() => {
    if (!started || reduced || !nameRef.current) return;
    const letters = nameRef.current.querySelectorAll("span[aria-hidden]");
    const ctx = gsap.context(() => {
      gsap.from(letters, {
        yPercent: 120,
        opacity: 0,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.05,
        delay: 0.15,
      });
      gsap.from(".hero__headline, .hero__cue", {
        opacity: 0,
        y: 24,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.15,
        delay: 0.9,
      });
    });
    return () => ctx.revert();
  }, [started, reduced]);

  /* The single scroll-driven loop. */
  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current!;
    const beats = beatRefs.current;
    let raf = 0;

    const lerpColor = (t: number) => {
      // stage-0 (#171215) → warm blush glow (#2a2024 tinted)
      const a = [23, 18, 21];
      const b = [46, 34, 40];
      const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    };

    const tick = () => {
      const rect = stage.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      progressRef.current = p;

      // Hero fades out over the first sliver of scroll.
      const heroP = Math.min(1, Math.max(0, (0.12 - p) / 0.12));
      if (heroRef.current) {
        heroRef.current.style.opacity = String(heroP);
        heroRef.current.style.transform = `translateY(${(1 - heroP) * -26}px)`;
      }
      if (cueRef.current) cueRef.current.style.opacity = String(heroP);

      // The bottle "turns" and the camera drifts closer through the ritual.
      if (bottleRef.current) {
        const scale = 1 + p * 0.2;
        const rot = -3 + p * 7;
        bottleRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
      }

      // Beats crossfade sequentially across the remaining scroll.
      const bp = Math.min(1, Math.max(0, (p - 0.15) / 0.82));
      const n = beats.length;
      const seg = bp * n;
      beats.forEach((el, i) => {
        if (!el) return;
        const t = seg - i; // 0..1 while this beat is "active"
        const vis = t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0;
        el.style.opacity = String(vis);
        el.style.transform = `translateY(${(1 - vis) * 22}px)`;
      });

      // Backdrop warms; the glow swells.
      if (stickyRef.current)
        stickyRef.current.style.backgroundColor = lerpColor(p);
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.15 + p * 0.55);
        glowRef.current.style.transform = `translate(-50%, -50%) scale(${0.7 + p * 0.9})`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  /* ---------- Reduced-motion / static layout ---------- */
  if (reduced) {
    return (
      <>
        <div id="top" />
        <section className="stage-static" aria-label="Hero">
          <div className="stage-static__hero">
            <span className="eyebrow">The Transformation Ritual</span>
            <SplitLetters text={SALON.name} className="hero__name serif-display" />
            <p className="hero__tagline">{SALON.tagline}</p>
            <h1 className="hero__headline serif-display">{SALON.heroHeadline}</h1>
            <div className="stage-static__bottle">
              <img src={HERO_IMG} alt={HERO_ALT} />
            </div>
          </div>
        </section>
        <section id="ritual" className="ritual-static section" aria-label="The Ritual">
          <div className="section-inner">
            <span className="eyebrow">The Ritual</span>
            <ol className="ritual-static__list">
              {RITUAL_BEATS.map((b) => (
                <li key={b.index}>
                  <span className="ritual-static__index">{b.index}</span>
                  <p>{b.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </>
    );
  }

  /* ---------- Motion layout ---------- */
  return (
    <>
      <div id="top" />
      <section
        id="ritual"
        ref={stageRef}
        className="stage"
        aria-label="The Ritual"
        style={{ height: `${100 + RITUAL_BEATS.length * 95}vh` }}
      >
        <div ref={stickyRef} className="stage__sticky">
          <div ref={glowRef} className="stage__glow" aria-hidden="true" />

          {/* Ambient particles (WebGL) behind the bottle */}
          {use3D && (
            <div className="stage__canvas">
              <Suspense fallback={null}>
                <Stage3D progressRef={progressRef} />
              </Suspense>
            </div>
          )}

          {/* The real signature bottle, composited onto the dark stage */}
          <div ref={bottleRef} className="stage__bottle">
            <div className="stage__bottle-float">
              <img src={HERO_IMG} alt={HERO_ALT} className="stage__bottle-img" />
              <span className="stage__bottle-scrim" aria-hidden="true" />
            </div>
          </div>

          {/* Hero overlay — wordmark sits above the bottle */}
          <div ref={heroRef} className="hero">
            <div className="hero__top">
              <span className="eyebrow hero__eyebrow">The Transformation Ritual</span>
              <SplitLetters
                ref={nameRef}
                text={SALON.name}
                className="hero__name serif-display"
              />
              <p className="hero__tagline">{SALON.tagline}</p>
            </div>
            <h1 className="hero__headline serif-display">{SALON.heroHeadline}</h1>
          </div>

          {/* Ritual beats — pinned centre, crossfading */}
          <div className="beats" aria-hidden="false">
            {RITUAL_BEATS.map((b, i) => (
              <div
                key={b.index}
                ref={(el) => (beatRefs.current[i] = el)}
                className="beat"
              >
                <span className="beat__index">{b.index}</span>
                <p className="beat__line serif-display">{b.line}</p>
              </div>
            ))}
          </div>

          <div ref={cueRef} className="hero__cue" aria-hidden="true">
            <span>Scroll</span>
            <span className="hero__cue-line" />
          </div>
        </div>
      </section>
    </>
  );
}
