import { PRODUCTS } from "../lib/content";
import { asset } from "../lib/asset";
import Reveal from "./Reveal";
import "./Products.css";

/**
 * The Shelf — a small retail moment. Three take-home products (serum + care),
 * each a framed product shot with name, one-line and a "from" price. Expects
 * product-1..3.jpg; if a file is missing the card falls back to a themed
 * gradient so nothing breaks before the real imagery lands.
 */
export default function Products() {
  return (
    <section id="shelf" className="section shelf" aria-label="The Shelf">
      <div className="section-inner">
        <Reveal className="shelf__head">
          <span className="eyebrow">The Shelf</span>
          <h2 className="section-title">Carry the ritual home.</h2>
          <p className="lede">
            The same formulations we reach for in the chair — a short, considered
            lineup to keep the result alive between visits.
          </p>
        </Reveal>

        <Reveal className="shelf__grid" stagger y={40}>
          {PRODUCTS.map((prod, i) => (
            <article key={prod.name} className={`prod-card prod-card--${prod.tone}`}>
              <div className="prod-card__media">
                <img
                  className="prod-card__img"
                  src={asset(`images/product-${i + 1}.jpg`)}
                  alt={`${prod.name} — ${prod.copy}`}
                  loading="lazy"
                  decoding="async"
                  width={1000}
                  height={1250}
                  onError={(e) => {
                    // hide a missing file so the themed placeholder shows through
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              </div>
              <div className="prod-card__body">
                <div className="prod-card__row">
                  <h3 className="prod-card__name">{prod.name}</h3>
                  <span className="prod-card__price">{prod.from}</span>
                </div>
                <p className="prod-card__copy">{prod.copy}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
