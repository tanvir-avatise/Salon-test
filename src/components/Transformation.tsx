import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import PlaceholderImage from "./PlaceholderImage";
import Reveal from "./Reveal";
import "./Transformation.css";

/**
 * Section 4 — The Transformation. A before → after reveal: drag (or use the
 * keyboard slider) to wipe the raw, cool "before" away and let the warm,
 * radiant "after" bloom through. Under reduced motion the slider rests at the
 * after-state with a soft glow.
 */
export default function Transformation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(prefersReducedMotion() ? 72 : 50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(98, Math.max(2, pct)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [setFromClientX]);

  return (
    <section className="section transform" aria-label="The Transformation">
      <div className="section-inner transform__inner">
        <Reveal className="transform__copy">
          <span className="eyebrow">The Transformation</span>
          <p className="transform__line serif-display">
            This is the after.
            <br />
            This is you.
          </p>
        </Reveal>

        <Reveal className="transform__frame-wrap" y={48}>
          <div
            ref={wrapRef}
            className="transform__frame"
            onPointerDown={(e) => {
              dragging.current = true;
              setFromClientX(e.clientX);
            }}
          >
            {/* AFTER — full, warm & radiant */}
            <div className="transform__layer transform__after">
              <PlaceholderImage variant="portrait" mood="warm" label="After — radiant" />
              <span className="transform__tag transform__tag--after">After</span>
            </div>

            {/* BEFORE — clipped, raw & cool */}
            <div
              className="transform__layer transform__before"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <PlaceholderImage variant="portrait" mood="raw" label="Before — raw" />
              <span className="transform__tag transform__tag--before">Before</span>
            </div>

            {/* handle */}
            <div
              className="transform__handle"
              style={{ left: `${pos}%` }}
              role="slider"
              tabIndex={0}
              aria-label="Reveal the transformation"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setPos((p) => Math.max(2, p - 4));
                if (e.key === "ArrowRight") setPos((p) => Math.min(98, p + 4));
              }}
            >
              <span className="transform__grip" aria-hidden="true">
                <i />
                <i />
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
