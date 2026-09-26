import { lazy, Suspense, useEffect, type PointerEvent } from "react";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { live } from "@/lib/live";
import { Loader } from "@/components/layout/Loader";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Cases } from "@/components/sections/Cases";
import { Experience } from "@/components/sections/Experience";
import { OpenSource } from "@/components/sections/OpenSource";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { BackToTop } from "@/components/overlays/BackToTop";
import { CaseDrawer } from "@/components/overlays/CaseDrawer";
import { CommandPalette } from "@/components/overlays/CommandPalette";
import { Modal } from "@/components/overlays/Modal";
import { Toast } from "@/components/overlays/Toast";

const VercelInsights = lazy(() => import("@/components/effects/VercelInsights").then((m) => ({ default: m.VercelInsights })));

const productionAnalyticsEnabled = import.meta.env.PROD && import.meta.env.VITE_ENABLE_PROD_ANALYTICS === "true";

/** Spotlight ([data-spot]), inclinação ([data-tilt]) e botões magnéticos ([data-magnetic]) por delegação. */
function onPointerMove(e: PointerEvent<HTMLDivElement>) {
  const t = e.target as HTMLElement | null;
  if (!t?.closest) return;
  const spot = t.closest<HTMLElement>("[data-spot]");
  if (spot) {
    const r = spot.getBoundingClientRect();
    spot.style.setProperty("--mx", e.clientX - r.left + "px");
    spot.style.setProperty("--my", e.clientY - r.top + "px");
    if (spot.dataset.tilt && live.motion && e.pointerType === "mouse") {
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      spot.style.transform = `perspective(1000px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-6px)`;
    }
  }
  const mag = t.closest<HTMLElement>("[data-magnetic]");
  if (mag && live.motion && e.pointerType === "mouse") {
    const r = mag.getBoundingClientRect();
    mag.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
  }
}

function onPointerOut(e: PointerEvent<HTMLDivElement>) {
  const t = e.target as HTMLElement | null;
  if (!t?.closest) return;
  ["[data-tilt]", "[data-magnetic]"].forEach((sel) => {
    const el = t.closest<HTMLElement>(sel);
    if (el && !el.contains(e.relatedTarget as Node | null)) el.style.transform = "";
  });
}

function useMouseTracking() {
  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => {
      live.mouse.x = e.clientX;
      live.mouse.y = e.clientY;
      live.mouse.in = true;
    };
    const leave = () => {
      live.mouse.in = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
}

function Portfolio() {
  useMouseTracking();
  return (
    <div className="relative" onPointerMove={onPointerMove} onPointerOut={onPointerOut}>
      <Loader />
      <a href="#conteudo" className="fixed -left-[9999px] top-3 z-[200] rounded-xl bg-surface px-4 py-3 font-semibold text-head focus:left-4">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <Skills />
        <Cases />
        <Experience />
        <OpenSource />
        <About />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <CaseDrawer />
      <CommandPalette />
      <Modal />
      <Toast />
      {productionAnalyticsEnabled ? (
        <Suspense fallback={null}>
          <VercelInsights />
        </Suspense>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <Portfolio />
    </PortfolioProvider>
  );
}
