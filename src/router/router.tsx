import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { NAV, parseRoute, type Route } from "@/data/routes";
import { isSoftMotion } from "@/lib/motion";

/** Prefixo do deploy (ex.: "/Myportfolio" no GitHub Pages); vazio na Vercel. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const withBase = (path: string): string => (BASE ? BASE + (path === "/" ? "/" : path) : path);

export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || "/";
  return pathname;
}

export interface NavState {
  /** Habilidade a abrir na página Habilidades. */
  skill?: string;
  /** Rolar até a lista de habilidades depois de abrir. */
  jump?: boolean;
}

interface HistoryEntry {
  key: string;
  nav?: NavState;
}

interface Location {
  path: string;
  key: string;
  nav: NavState;
  /** Navegação feita pelo próprio app (não a primeira carga). */
  navigated: boolean;
  /** Rolagem a aplicar depois de renderizar. */
  scrollY: number;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: NavState;
}

interface RouterValue {
  route: Route;
  location: Location;
  navigate: (to: string, opts?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

const newKey = () => Math.random().toString(36).slice(2, 10);

function currentEntry(): HistoryEntry {
  const s = history.state as HistoryEntry | null;
  return s && typeof s.key === "string" ? s : { key: "inicial" };
}

/** Posição de rolagem de cada entrada do histórico, para restaurar ao voltar. */
const scrollMemo = new Map<string, number>();

/** Ordem das abas para decidir a direção da transição (avançar ou voltar). */
function routeIndex(route: Route): number {
  if (route.name === "nao-encontrada") return NAV.length;
  const i = NAV.findIndex((n) => n.id === route.tab);
  return route.name === "projeto" ? i + 0.5 : i;
}

type PageLoader = (route: Route) => Promise<unknown>;
let preloadPage: PageLoader = () => Promise.resolve();
/** O registro de páginas informa como carregar o código de uma rota antes da transição. */
export function setPagePreloader(fn: PageLoader) {
  preloadPage = fn;
}

function runTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (!doc.startViewTransition || isSoftMotion()) {
    update();
    return;
  }
  try {
    doc.startViewTransition(update);
  } catch {
    update();
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(() => {
    const entry = currentEntry();
    if (!history.state) history.replaceState({ key: entry.key }, "");
    return { path: stripBase(window.location.pathname), key: entry.key, nav: entry.nav ?? {}, navigated: false, scrollY: 0 };
  });
  const locRef = useRef(location);
  locRef.current = location;
  const seq = useRef(0);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  const go = useCallback((next: Omit<Location, "navigated">) => {
    const from = parseRoute(locRef.current.path);
    const to = parseRoute(next.path);
    const id = ++seq.current;
    scrollMemo.set(locRef.current.key, window.scrollY);
    const dir = routeIndex(to) > routeIndex(from) ? "fwd" : routeIndex(to) < routeIndex(from) ? "back" : "same";
    preloadPage(to)
      .catch(() => undefined)
      .then(() => {
        if (id !== seq.current) return;
        document.documentElement.dataset.dir = dir;
        window.dispatchEvent(new CustomEvent("nasck:navigate"));
        runTransition(() => {
          flushSync(() => setLocation({ ...next, navigated: true }));
        });
      });
  }, []);

  const navigate = useCallback(
    (to: string, opts: NavigateOptions = {}) => {
      const url = new URL(to, window.location.origin);
      const path = url.pathname;
      const same = path === locRef.current.path;
      const entry: HistoryEntry = { key: newKey(), nav: opts.state };
      if (opts.replace || same) history.replaceState(entry, "", withBase(path) + url.search + url.hash);
      else history.pushState(entry, "", withBase(path) + url.search + url.hash);
      go({ path, key: entry.key, nav: opts.state ?? {}, scrollY: same ? window.scrollY : 0 });
    },
    [go],
  );

  useEffect(() => {
    const onPop = () => {
      const raw = history.state as HistoryEntry | null;
      const path = stripBase(window.location.pathname);
      // Navegação só por âncora (ex.: "Pular para o conteúdo") não troca de página.
      if (path === locRef.current.path && (!raw?.key || raw.key === locRef.current.key)) return;
      const entry = currentEntry();
      go({ path, key: entry.key, nav: entry.nav ?? {}, scrollY: scrollMemo.get(entry.key) ?? 0 });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [go]);

  const value = useMemo(() => ({ route: parseRoute(location.path), location, navigate }), [location, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter precisa de <RouterProvider>");
  return ctx;
}

export const useRoute = (): Route => useRouter().route;
export const useNavigate = () => useRouter().navigate;
