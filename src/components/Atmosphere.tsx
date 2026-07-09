import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";
import "./Atmosphere.css";

/**
 * Section 7 — Atmosphere. A full-bleed sensory moment. In place of a video
 * asset we render a slow, breathing field of warm light that drifts on scroll
 * — the feeling of the room without the file weight. A short poetic line sits
 * over it.
 */
export default function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.from(".atmosphere__line span", {
        opacity: 0,
        y: 40,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 60%", once: true },
      });
    }, ref);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={ref} className="atmosphere" aria-label="Atmosphere">
      <div ref={bgRef} className="atmosphere__bg" aria-hidden="true">
        <span className="atmosphere__orb atmosphere__orb--1" />
        <span className="atmosphere__orb atmosphere__orb--2" />
        <span className="atmosphere__orb atmosphere__orb--3" />
      </div>
      <div className="atmosphere__grain" aria-hidden="true" />
      <p className="atmosphere__line serif-display">
        <span>Low light.</span> <span>Warm hands.</span> <span>Time that slows.</span>
      </p>
      <span className="atmosphere__cap">The room, mid-afternoon</span>
    </section>
  );
}
