import { useRef, type ReactNode } from "react";
import { gsap, isTouch, prefersReducedMotion } from "../lib/motion";

/**
 * Magnetic button — the label is gently pulled toward the cursor and springs
 * back on leave. Falls back to a plain anchor on touch / reduced-motion.
 */
export default function MagneticButton({
  href,
  children,
  className,
  target,
  rel,
  strength = 0.35,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  strength?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const enabled = !isTouch() && !prefersReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current || !labelRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(ref.current, { x: x * strength, y: y * strength, duration: 0.6, ease: "power3" });
    gsap.to(labelRef.current, { x: x * strength * 0.4, y: y * strength * 0.4, duration: 0.6, ease: "power3" });
  };

  const onLeave = () => {
    if (!enabled || !ref.current || !labelRef.current) return;
    gsap.to([ref.current, labelRef.current], {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      data-cursor="hover"
    >
      <span ref={labelRef} className="magnetic__label">
        {children}
      </span>
    </a>
  );
}
