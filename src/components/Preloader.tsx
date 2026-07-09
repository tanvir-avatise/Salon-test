import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { SALON } from "../lib/content";
import SplitLetters from "./SplitLetters";
import "./Preloader.css";

/**
 * Preloader — a filling progress bar over a blush base. On complete the
 * salon name reveals letter-by-letter in the serif, then the whole panel
 * lifts away to unveil the dark hero stage.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finish = () => {
      setGone(true);
      onDone();
    };

    if (prefersReducedMotion()) {
      // No theatre — reveal name briefly then hand off immediately.
      const t = setTimeout(finish, 400);
      return () => clearTimeout(t);
    }

    const root = rootRef.current!;
    const letters = nameRef.current!.querySelectorAll("span[aria-hidden]");
    const counter = { v: 0 };

    const tl = gsap.timeline({ onComplete: finish });

    tl.to(counter, {
      v: 100,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate: () => {
        const n = Math.round(counter.v);
        if (barRef.current)
          barRef.current.style.transform = `scaleX(${n / 100})`;
        if (countRef.current) countRef.current.textContent = `${n}`;
      },
    })
      .fromTo(
        letters,
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
        },
        "-=0.7"
      )
      .to({}, { duration: 0.45 })
      .to(
        [countRef.current, ".preloader__track"],
        { opacity: 0, duration: 0.5, ease: "power2.out" },
        "<"
      )
      .to(root, {
        yPercent: -100,
        duration: 1.2,
        ease: "expo.inOut",
      })
      .set(root, { pointerEvents: "none" });

    return () => {
      tl.kill();
    };
  }, [onDone]);

  if (gone && prefersReducedMotion()) return null;

  return (
    <div ref={rootRef} className="preloader" role="status" aria-live="polite">
      <div className="preloader__inner">
        <span className="preloader__eyebrow eyebrow">The Transformation Ritual</span>
        <SplitLetters
          ref={nameRef}
          text={SALON.name}
          className="preloader__name serif-display"
        />
        <div className="preloader__track">
          <span ref={barRef} className="preloader__bar" />
        </div>
        <span ref={countRef} className="preloader__count">
          0
        </span>
      </div>
      <span className="a11y-visually-hidden">Loading LUMÉRA</span>
    </div>
  );
}
