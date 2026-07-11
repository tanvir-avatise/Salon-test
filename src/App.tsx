import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { ScrollTrigger } from "./lib/motion";
import Preloader from "./components/Preloader";
import Grain from "./components/Grain";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import RitualStage from "./components/RitualStage";
import RitualJourney from "./components/RitualJourney";
import Transformation from "./components/Transformation";
import MotionMoment from "./components/MotionMoment";
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
        <RitualStage started={started} />
        <RitualJourney />
        <Transformation />
        <MotionMoment />
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
