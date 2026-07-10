import { SALON } from "../lib/content";
import Reveal from "./Reveal";
import MapEmbed from "./MapEmbed";
import "./Footer.css";

/**
 * Section 10 — Footer. Two columns: visit details (hours, address, contact)
 * and an embedded map, with socials along the base. The salon name gives one
 * last, quiet flourish.
 */
export default function Footer() {
  const mapQuery = `${SALON.address.line1}, ${SALON.address.line2}`;

  return (
    <footer id="footer" className="footer" aria-label="Visit us">
      <div className="section-inner footer__inner">
        <Reveal className="footer__lead" y={30}>
          <span className="eyebrow">Visit the atelier</span>
          <p className="footer__brand serif-display">{SALON.name}</p>
          <p className="footer__tagline">{SALON.tagline}</p>
        </Reveal>

        <div className="footer__cols">
          <div className="footer__col">
            <h3>Hours</h3>
            <ul className="footer__hours">
              {SALON.hours.map((h) => (
                <li key={h.day}>
                  <span>{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3>Find us</h3>
            <address className="footer__address">
              {SALON.address.line1}
              <br />
              {SALON.address.line2}
            </address>
            <a className="footer__link" href={`tel:${SALON.phone.replace(/\s/g, "")}`}>
              {SALON.phone}
            </a>
            <a className="footer__link" href={`mailto:${SALON.email}`}>
              {SALON.email}
            </a>
          </div>

          <div className="footer__col footer__map">
            <div className="footer__map-frame">
              <MapEmbed query={mapQuery} label={`Map to ${SALON.name} atelier`} />
            </div>
          </div>
        </div>

        <div className="footer__base">
          <ul className="footer__socials">
            {SALON.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="footer__fine">
            © {new Date().getFullYear()} {SALON.name} · Crafted as a flagship
            concept · Placeholder content
          </p>
        </div>
      </div>
    </footer>
  );
}
