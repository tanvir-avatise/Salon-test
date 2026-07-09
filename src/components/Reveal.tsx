import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** stagger children instead of the element itself */
  stagger?: boolean;
  delay?: number;
  y?: number;
};

/**
 * Gentle scroll-into-view reveal: a slow, weighted rise + fade with an
 * indulgent ease-out. Respects reduced motion (content simply present).
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  stagger = false,
  delay = 0,
  y = 34,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const targets = stagger ? Array.from(el.children) : el;

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.3,
        delay,
        ease: "expo.out",
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, delay, y]);

  useEffect(() => {
    // ensure triggers recalc after fonts/layout settle
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Tag ref={ref as never} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
