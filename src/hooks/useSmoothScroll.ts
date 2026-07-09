import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

/**
 * Weighted, buttery smooth scrolling via Lenis, driven off GSAP's ticker so
 * ScrollTrigger stays perfectly in sync with the pinned sections.
 *
 * Disabled entirely under prefers-reduced-motion — the page then scrolls
 * natively and every section renders its static fallback.
 *
 * Returns the Lenis instance (or null) so the nav can request smooth
 * anchor scrolls.
 */
export function useSmoothScroll(
  onReady?: (lenis: Lenis | null) => void
): void {
  useEffect(() => {
    if (prefersReducedMotion()) {
      onReady?.(null);
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      // slow, indulgent ease-out
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      lerp: 0.09,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    onReady?.(lenis);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
