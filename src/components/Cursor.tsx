import { useEffect, useRef } from "react";
import { gsap, isTouch, prefersReducedMotion } from "../lib/motion";
import "./Cursor.css";

/**
 * Custom cursor: a soft rose-gold dot with a trailing ring that eases behind
 * the pointer and swells over interactive elements. Disabled on touch and
 * under reduced-motion, where the native cursor is restored.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) {
      document.body.classList.add("native-cursor");
      return;
    }

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    const xTo = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    const dxTo = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dyTo = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });

    let visible = false;
    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.4 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      dxTo(e.clientX);
      dyTo(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], [data-cursor='hover']"
      );
      gsap.to(ring, {
        scale: t ? 2.1 : 1,
        borderColor: t ? "rgba(201,154,138,0.9)" : "rgba(201,154,138,0.5)",
        duration: 0.4,
        ease: "power3",
      });
    };

    const leave = () =>
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
