import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PROJECTS, projectPath } from "@/data/projects";
import { metaFor } from "@/data/routes";
import { SITE_URL } from "@/data/site";
import { PageView } from "@/pages/registry";
import { useRouter } from "@/router/router";
import { Appearance } from "./Appearance";
import { Footer } from "./Footer";
import { Dock, SideNav } from "./Navigation";
import { BackToTop, Boot, Lightbox, MoreSheet, MotionNote, shouldBoot, Toast } from "./Overlays";
import { Palette } from "./Palette";
import { TopBar } from "./TopBar";
import { useUi } from "./ui";

const VercelInsights = lazy(() => import("./VercelInsights").then((m) => ({ default: m.VercelInsights })));
const analyticsOn = import.meta.env.PROD && import.meta.env.VITE_ENABLE_PROD_ANALYTICS === "true";

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** Título, descrição e canonical da rota atual (o pré-render já entrega isso no HTML; aqui vale para a navegação no app). */
function useDocumentMeta() {
  const { route } = useRouter();
  useEffect(() => {
    const m = metaFor(route);
    document.title = m.title;
    setMeta('meta[name="description"]', "content", m.description);
    setMeta('link[rel="canonical"]', "href", SITE_URL + (m.path === "/" ? "/" : m.path));
    document.body.dataset.route = route.name;
  }, [route]);
}

/** Atalhos globais: Ctrl/Cmd K e "/" abrem a busca; setas trocam de estudo de caso. */
function useShortcuts() {
  const { route, navigate } = useRouter();
  const { panel, openPanel, closePanel } = useUi();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && /^(input|textarea|select)$/i.test(t.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (panel === "palette") closePanel();
        else openPanel("palette");
        return;
      }
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openPanel("palette");
        return;
      }
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !typing && !e.altKey && !e.ctrlKey && !e.metaKey && !document.querySelector("dialog[open]")) {
        if (route.name !== "projeto" || t?.closest?.(".gallery")) return;
        const i = PROJECTS.findIndex((p) => p.id === route.projectId);
        const n = PROJECTS[(i + (e.key === "ArrowRight" ? 1 : PROJECTS.length - 1)) % PROJECTS.length]!;
        navigate(projectPath(n.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route, navigate, panel, openPanel, closePanel]);
}

function NavProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const run = () => {
      const el = ref.current;
      if (!el) return;
      el.classList.remove("run");
      void el.offsetWidth;
      el.classList.add("run");
    };
    window.addEventListener("nasck:navigate", run);
    return () => window.removeEventListener("nasck:navigate", run);
  }, []);
  return <div className="nprog" ref={ref} aria-hidden="true" />;
}

export function Shell() {
  const { route, location } = useRouter();
  const { closePanel } = useUi();
  const mainRef = useRef<HTMLElement>(null);
  const [booting, setBooting] = useState(shouldBoot);
  const [first, setFirst] = useState(true);

  useDocumentMeta();
  useShortcuts();

  useLayoutEffect(() => {
    document.documentElement.dataset.booting = booting ? "1" : "0";
  }, [booting]);

  // Depois de cada navegação: rolagem (topo ou posição salva) e foco no conteúdo.
  useLayoutEffect(() => {
    if (!location.navigated) return;
    setFirst(false);
    closePanel();
    window.scrollTo(0, location.scrollY);
    mainRef.current?.focus({ preventScroll: true });
    // closePanel é estável o bastante; só a troca de entrada importa aqui.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return (
    <div className="shell">
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      {booting ? (
        <Boot
          onDone={() => {
            setBooting(false);
            window.dispatchEvent(new CustomEvent("nasck:booted"));
          }}
        />
      ) : null}
      <NavProgress />
      <SideNav />
      <div className="app">
        <TopBar main={mainRef} />
        <main id="conteudo" className={`wrap${first && !booting ? " first" : ""}`} tabIndex={-1} ref={mainRef} key={location.key}>
          <PageView route={route} />
        </main>
        <Footer />
      </div>
      <Dock />
      <MoreSheet />
      <Palette />
      <Appearance />
      <Lightbox />
      <MotionNote />
      <BackToTop />
      <Toast />
      {analyticsOn ? (
        <Suspense fallback={null}>
          <VercelInsights />
        </Suspense>
      ) : null}
    </div>
  );
}
