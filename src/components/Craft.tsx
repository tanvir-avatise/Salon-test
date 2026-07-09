import PlaceholderImage from "./PlaceholderImage";
import Reveal from "./Reveal";
import "./Craft.css";

/**
 * Section 6 — The Craft / Team. A split layout: a portrait/workspace frame
 * alongside the atelier's philosophy, with the rose-gold accent carrying a
 * single highlighted phrase.
 */
export default function Craft() {
  return (
    <section id="craft" className="section craft" aria-label="The Craft">
      <div className="section-inner craft__inner">
        <Reveal className="craft__media" y={48}>
          <PlaceholderImage
            variant="workspace"
            mood="warm"
            label="The atelier — portrait and workspace"
            className="craft__img"
          />
          <span className="craft__caption">Founder &amp; Creative Director — R. Vasquez</span>
        </Reveal>

        <Reveal className="craft__copy" stagger>
          <span className="eyebrow">The Craft</span>
          <h2 className="section-title">
            We treat every head of hair as its own material.
          </h2>
          <p className="lede">
            No two people carry light the same way. So we read the fall, the
            density, the way you actually live — then work slowly, by hand,
            until the shape and the colour feel <em className="craft__accent">inevitable</em>.
          </p>
          <p className="lede">
            The atelier is small on purpose. Fewer chairs, more attention;
            time to get the details right and the space to let you exhale.
          </p>
          <ul className="craft__stats">
            <li>
              <strong>18 yrs</strong>
              <span>refining the craft</span>
            </li>
            <li>
              <strong>4 hands</strong>
              <span>one guest at a time</span>
            </li>
            <li>
              <strong>∞</strong>
              <span>cups of tea poured</span>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
