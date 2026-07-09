import { REVIEWS } from "../lib/content";
import Reveal from "./Reveal";
import "./Reviews.css";

/**
 * Section 8 — Reviews / social proof. A gently drifting marquee of guest
 * words. The track is duplicated for a seamless loop; the animation pauses on
 * hover and is stilled entirely under reduced motion.
 */
export default function Reviews() {
  const loop = [...REVIEWS, ...REVIEWS];
  return (
    <section className="section on-light reviews" aria-label="What guests say">
      <div className="section-inner">
        <Reveal className="reviews__head">
          <span className="eyebrow">In their words</span>
          <div className="reviews__rating">
            <span className="reviews__stars" aria-hidden="true">★★★★★</span>
            <span className="reviews__score">4.9 average · 600+ guests</span>
          </div>
        </Reveal>
      </div>

      <div className="reviews__marquee" role="list">
        <div className="reviews__track">
          {loop.map((r, i) => (
            <figure className="review-card" role="listitem" key={i}>
              <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption>— {r.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
