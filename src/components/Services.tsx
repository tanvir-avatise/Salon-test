import { SERVICES } from "../lib/content";
import { asset } from "../lib/asset";
import Reveal from "./Reveal";
import "./Services.css";

/**
 * Section 5 — Signature Services. A few curated treatment cards: image, name,
 * one-line description and an optional "from" price.
 */
export default function Services() {
  return (
    <section id="services" className="section on-light services" aria-label="Signature Services">
      <div className="section-inner">
        <Reveal className="services__head">
          <span className="eyebrow">Signature Services</span>
          <h2 className="section-title">A few signatures,<br />perfected over years.</h2>
        </Reveal>

        <Reveal className="services__grid" stagger y={40}>
          {SERVICES.map((s, i) => (
            <article key={s.name} className={`svc-card svc-card--${s.tone}`}>
              <div className="svc-card__media">
                <img
                  className="svc-card__img"
                  src={asset(`images/service-${i + 1}.jpg`)}
                  alt={`${s.name} — ${s.copy}`}
                  loading="lazy"
                  decoding="async"
                  width={445}
                  height={660}
                />
              </div>
              <div className="svc-card__body">
                <div className="svc-card__row">
                  <h3 className="svc-card__name">{s.name}</h3>
                  {s.from && <span className="svc-card__price">{s.from}</span>}
                </div>
                <p className="svc-card__copy">{s.copy}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
