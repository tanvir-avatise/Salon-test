import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import Snap from "lenis/snap";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { ScrollTrigger } from "./lib/motion";
import Preloader from "./components/Preloader";
import Grain from "./components/Grain";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import RitualStage from "./components/RitualStage";
import RitualJourney from "./components/RitualJourney";
import Transformation from "./components/Transformation";
import Services from "./components/Services";
import Craft from "./components/Craft";
import Products from "./components/Products";
import Atmosphere from "./components/Atmosphere";
import Reviews from "./components/Reviews";
import Booking from "./components/Booking";
import Footer from "./components/Footer";

export default function App() {
  const [started, setStarted] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useSmoothScroll((instance) => {
    lenisRef.current = instance;
    setLenis(instance);
    // Hold the page still under the preloader.
    instance?.stop();
  });

  // Release scroll once the preloader lifts; recalc triggers after reveal.
  useEffect(() => {
    if (!started) return;
    lenisRef.current?.start();
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(t);
  }, [started]);

  // Snap to the START of each major section so a free scroll always lands at a
  // section's beginning — never mid-scrub. Proximity + a small threshold means
  // it only engages near a boundary, so scrubbing WITHIN the long pinned hero
  // and Journey stays smooth and untrapped.
  useEffect(() => {
    if (!lenis || !started) return;
    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "16%",
      duration: 0.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    const selectors = [
      "#ritual",
      "#journey",
      ".transform",
      "#services",
      "#craft",
      "#shelf",
      ".reviews",
      "#booking",
      "#footer",
    ];
    const removers: Array<() => void> = [];
    selectors.forEach((sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) removers.push(snap.addElement(el, { align: ["start"], ignoreSticky: true }));
    });
    // recompute once fonts/images/pin layout settle
    const t = setTimeout(() => snap.resize(), 700);
    return () => {
      clearTimeout(t);
      removers.forEach((r) => r());
      snap.destroy();
    };
  }, [lenis, started]);

  // Keep native scroll pinned to top while the preloader is up (reduced-motion path).
  useEffect(() => {
    if (started) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [started]);

  return (
    <>
      <Grain />
      <Cursor />
      <Preloader onDone={() => setStarted(true)} />
      <Nav lenis={lenis} />

      <main>
        {/* One continuous background carries colour across intro → hero →
            Journey so the top of the site reads as a single cinematic flow. */}
        <div className="flow-top">
          <RitualStage started={started} />
          <RitualJourney />
        </div>
        <Transformation />
        <Services />
        <Craft />
        <Products />
        <Atmosphere />
        <Reviews />
        <Booking />
        <Footer />
      </main>
    </>
  );
}
