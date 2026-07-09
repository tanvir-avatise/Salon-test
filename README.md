# LUMÉRA — The Transformation Ritual

A single-page, scroll-driven flagship marketing site for a fictional hair &
beauty atelier. The concept is a calm, cinematic **transformation ritual**: the
visitor scrolls from raw and dark toward warm and radiant, mirroring the salon
experience and landing on a booking invitation.

Everything here is **original code and asset-free**: the "signature product"
is a procedurally-built WebGL bottle, and all imagery is rendered from layered
SVG/gradient placeholders themed to the palette. No real site's code or assets
were copied.

## Experience

- **Preloader** — a filling progress bar over a blush base; the salon name
  reveals letter-by-letter in the serif, then the panel lifts to the dark stage.
- **Hero + The Ritual** — one persistent WebGL stage. A frosted-glass bottle
  floats under a rose-gold rim light amid ambient dust; a single scroll progress
  drives the hero fade, the crossfading ritual beats, the bottle's rotation, the
  camera drifting closer, and the backdrop warming from raw dark to blush glow.
- **The Transformation** — an interactive before → after reveal slider
  ("This is the after. This is you.").
- **Signature Services** — curated treatment cards.
- **The Craft** — split portrait / philosophy layout with a rose-gold accent.
- **Atmosphere** — a full-bleed, breathing field of warm light.
- **Reviews** — a drifting social-proof marquee.
- **Booking** — service + date/time selectors and a magnetic primary CTA that
  carries the choices to the booking link.
- **Footer** — hours, address, a stylised map with directions, contact, socials.

Throughout: a persistent pill nav, a custom trailing cursor, subtle film grain,
weighted smooth scrolling, and an optional procedurally-synthesised ambient
sound toggle.

## Design system

| Token          | Value                                             |
| -------------- | ------------------------------------------------- |
| Base blush     | `#F2EBE6`                                          |
| Deep plum ink  | `#2A2024`                                          |
| Rose-gold      | `#C99A8A`                                          |
| Emerald (2nd)  | `#4A6B5C`                                          |
| Serif          | Fraunces (salon name & titles)                    |
| Sans           | Inter / Neue Montreal (UI & body)                 |
| Motion         | Slow, weighted, indulgent ease-outs; soft bloom   |

## Tech

- **Vite + React + TypeScript**
- **GSAP + ScrollTrigger** — scroll-pinned animation & reveals
- **Lenis** — weighted smooth scrolling, synced to GSAP's ticker
- **React-Three-Fiber / three.js** + **@react-three/postprocessing** — the hero
  3D moment with a real-time bloom pass (code-split; only loaded when used)

## Accessibility & resilience

- Semantic, landmark-based HTML with accessible labels.
- **`prefers-reduced-motion`** fully respected: WebGL and smooth scroll are
  dropped and every section renders a calm, static layout.
- **Touch devices** swap the WebGL stage for a static SVG bottle and restore
  the native cursor.
- Fully responsive; the layout reflows to a single column on small screens.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to /dist
npm run preview  # serve the production build
```

> Content, prices, address, reviews and the booking link are all placeholders
> for a fictional atelier.
