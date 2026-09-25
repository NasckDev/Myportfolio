import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cases, EMAIL, skillGroups } from "@/data/portfolio";
import { copyText, readStorage, writeStorage } from "@/lib/clipboard";
import { live, type Theme } from "@/lib/live";
import { useViewport, type Viewport } from "@/hooks/useViewport";

export type ModalKind = "cv" | "avail" | "feedback" | "keys" | "skill";

interface PortfolioState {
  vp: Viewport;
  theme: Theme;
  motion: boolean;
  heroReady: boolean;
  modal: ModalKind | null;
  skillSel: number | null;
  palette: boolean;
  caseOpen: number;
  lastCase: number;
  openJob: number;
  toast: { msg: string; on: boolean };
  emailCopied: boolean;
}

interface PortfolioActions {
  setHeroReady: () => void;
  setTheme: (next: Theme, x: number, y: number) => void;
  toggleTheme: (origin?: HTMLElement | null) => void;
  toggleMotion: () => void;
  showToast: (msg: string) => void;
  openModal: (kind: ModalKind, skillSel?: number) => void;
  closeModal: () => void;
  openCase: (i: number) => void;
  closeCase: () => void;
  openPalette: () => void;
  closePalette: () => void;
  setOpenJob: (i: number) => void;
  scrollToId: (id: string) => void;
  copyEmail: () => Promise<void>;
  copySkills: () => Promise<void>;
}

type Ctx = PortfolioState & PortfolioActions;

const PortfolioContext = createContext<Ctx | null>(null);

function initialTheme(): Theme {
  const stored = readStorage("adn4-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "light";
}

function initialMotion(): boolean {
  const stored = readStorage("adn4-motion");
  if (stored !== null) return stored === "1";
  return !(typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const vp = useViewport();
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [motion, setMotion] = useState(initialMotion);
  const [heroReady, setHeroReadyState] = useState(false);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [skillSel, setSkillSel] = useState<number | null>(null);
  const [palette, setPalette] = useState(false);
  const [caseOpen, setCaseOpen] = useState(-1);
  const [lastCase, setLastCase] = useState(0);
  const [openJob, setOpenJob] = useState(0);
  const [toast, setToast] = useState({ msg: "", on: false });
  const [emailCopied, setEmailCopied] = useState(false);

  const returnFocus = useRef<{ modal: Element | null; palette: Element | null; drawer: Element | null }>({ modal: null, palette: null, drawer: null });
  const toastTimer = useRef<number | undefined>(undefined);
  const copiedTimer = useRef<number | undefined>(undefined);

  live.theme = theme;
  live.motion = motion;

  useEffect(() => {
    document.body.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#06121F" : "#FAFBFD");
  }, [theme]);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, on: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2400);
  }, []);

  const setTheme = useCallback((next: Theme, x: number, y: number) => {
    writeStorage("adn4-theme", next);
    const apply = () => {
      document.body.dataset.theme = next;
      live.theme = next;
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || !live.motion) {
      apply();
      setThemeState(next);
      return;
    }
    const vt = doc.startViewTransition(apply);
    vt.ready
      .then(() => {
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(
    (origin?: HTMLElement | null) => {
      const next: Theme = live.theme === "dark" ? "light" : "dark";
      let x = innerWidth - 80;
      let y = 40;
      if (origin) {
        const r = origin.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      setTheme(next, x, y);
    },
    [setTheme],
  );

  const toggleMotion = useCallback(() => {
    const next = !live.motion;
    writeStorage("adn4-motion", next ? "1" : "0");
    live.motion = next;
    setMotion(next);
    showToast(next ? "Animações ligadas" : "Animações desligadas");
  }, [showToast]);

  const openModal = useCallback((kind: ModalKind, sel?: number) => {
    setModal((cur) => {
      if (!cur) returnFocus.current.modal = document.activeElement;
      return kind;
    });
    if (sel !== undefined) setSkillSel(sel);
    setPalette(false);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const openCase = useCallback((i: number) => {
    // Ao navegar para o próximo case com a gaveta aberta, o foco de retorno continua o original.
    if (stateRef.current.caseOpen < 0) returnFocus.current.drawer = document.activeElement;
    setCaseOpen(i);
    setLastCase(i);
    setPalette(false);
  }, []);

  const closeCase = useCallback(() => setCaseOpen(-1), []);

  const openPalette = useCallback(() => {
    returnFocus.current.palette = document.activeElement;
    setPalette(true);
  }, []);
  const closePalette = useCallback(() => setPalette(false), []);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = id === "topo" ? 0 : el.getBoundingClientRect().top + live.scrollY - 90;
    window.scrollTo({ top, behavior: live.motion ? "smooth" : "auto" });
  }, []);

  const copyEmail = useCallback(async () => {
    const ok = await copyText(EMAIL);
    setEmailCopied(ok);
    showToast(ok ? "E-mail copiado para a área de transferência" : "Não foi possível copiar. Selecione o endereço.");
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setEmailCopied(false), 2400);
  }, [showToast]);

  const copySkills = useCallback(async () => {
    const txt = skillGroups.map((g) => g.title + ": " + g.items.map((i) => i.name).join(", ")).join("\n");
    const ok = await copyText(txt);
    showToast(ok ? "Lista de habilidades copiada" : "Não foi possível copiar a lista");
  }, [showToast]);

  const setHeroReady = useCallback(() => setHeroReadyState(true), []);

  // Travamento de scroll e retorno de foco para modais, gaveta e paleta.
  const prev = useRef({ modal, caseOpen, palette });
  useEffect(() => {
    const p = prev.current;
    const restore = (el: Element | null) => {
      if (el instanceof HTMLElement) el.focus({ preventScroll: true });
    };
    if (p.modal && !modal) {
      restore(returnFocus.current.modal);
      returnFocus.current.modal = null;
    }
    if (p.caseOpen >= 0 && caseOpen < 0) {
      restore(returnFocus.current.drawer);
      returnFocus.current.drawer = null;
    }
    if (p.palette && !palette && returnFocus.current.palette) {
      restore(returnFocus.current.palette);
      returnFocus.current.palette = null;
    }
    document.body.style.overflow = modal || caseOpen >= 0 ? "hidden" : "";
    prev.current = { modal, caseOpen, palette };
  }, [modal, caseOpen, palette]);

  // Link direto para um case (#case-id) e sincronização da URL.
  useEffect(() => {
    const hm = (location.hash || "").match(/^#case-(.+)$/);
    if (!hm) return;
    const ci = cases.findIndex((c) => c.id === hm[1]);
    if (ci < 0) return;
    const t = window.setTimeout(() => openCase(ci), 1600);
    return () => window.clearTimeout(t);
  }, [openCase]);

  const firstUrlSync = useRef(true);
  useEffect(() => {
    if (firstUrlSync.current) {
      firstUrlSync.current = false;
      return;
    }
    try {
      history.replaceState(null, "", caseOpen >= 0 ? "#case-" + cases[caseOpen].id : location.pathname + location.search);
    } catch {
      /* ignore */
    }
  }, [caseOpen]);

  // Atalhos globais de teclado.
  const stateRef = useRef({ modal, palette, caseOpen });
  stateRef.current = { modal, palette, caseOpen };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const tag = (e.target as HTMLElement | null)?.tagName || "";
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (s.palette) closePalette();
        else openPalette();
        return;
      }
      if (e.key === "/" && !typing && !s.palette) {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key === "Escape") {
        if (s.modal) closeModal();
        else if (s.palette) closePalette();
        else if (s.caseOpen >= 0) closeCase();
        return;
      }
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && !s.palette && !s.modal) {
        if (e.key === "?") {
          e.preventDefault();
          openModal("keys");
          return;
        }
        if (e.key === "t" || e.key === "T") {
          toggleTheme();
          return;
        }
        if (e.key === "m" || e.key === "M") toggleMotion();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCase, closeModal, closePalette, openModal, openPalette, toggleMotion, toggleTheme]);

  const value = useMemo<Ctx>(
    () => ({
      vp, theme, motion, heroReady, modal, skillSel, palette, caseOpen, lastCase, openJob, toast, emailCopied,
      setHeroReady, setTheme, toggleTheme, toggleMotion, showToast, openModal, closeModal, openCase, closeCase,
      openPalette, closePalette, setOpenJob, scrollToId, copyEmail, copySkills,
    }),
    [vp, theme, motion, heroReady, modal, skillSel, palette, caseOpen, lastCase, openJob, toast, emailCopied, setHeroReady, setTheme, toggleTheme, toggleMotion, showToast, openModal, closeModal, openCase, closeCase, openPalette, closePalette, scrollToId, copyEmail, copySkills],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
