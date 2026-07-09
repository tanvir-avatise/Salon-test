import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { SALON, NAV_LINKS } from "../lib/content";
import SoundToggle from "./SoundToggle";
import "./Nav.css";

/**
 * Persistent, minimal, pill-shaped top navigation. Fades in after the
 * preloader, hides on downward scroll and returns on the way up, and routes
 * anchor clicks through Lenis for a weighted glide.
 */
export default function Nav({ lenis }: { lenis: Lenis | null }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY.current && y > 320);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href) as HTMLElement | null;
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.4 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`nav ${hidden ? "nav--hidden" : ""} ${scrolled ? "nav--solid" : ""}`}>
      <nav className="nav__pill" aria-label="Primary">
        <a
          className="nav__brand serif-display"
          href="#top"
          onClick={(e) => go(e, "#top")}
        >
          {SALON.name}
        </a>
        <ul className="nav__links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={(e) => go(e, l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav__actions">
          <SoundToggle />
          <a
            className="nav__book"
            href={SALON.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book
          </a>
        </div>
      </nav>
    </header>
  );
}
