import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * True when the visitor has asked the OS to reduce motion.
 * Every scroll-pinned / animated component checks this and renders
 * a calm, static fallback instead.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Coarse pointer (touch) — used to swap WebGL / custom-cursor for lighter paths. */
export const isTouch = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none), (pointer: coarse)").matches;

export { gsap, ScrollTrigger };
