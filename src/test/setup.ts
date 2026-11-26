import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { reloadPrefs } from "@/lib/prefs";
import { jsonResponse } from "./http";

/** Consultas de mídia simuladas: por padrão, desktop com mouse e sem pedido de menos movimento. */
export const media = { hover: true, reduced: false };

function matchMediaMock(query: string): MediaQueryList {
  const matches =
    (query.includes("hover: hover") && media.hover) ||
    (query.includes("pointer: fine") && media.hover) ||
    (query.includes("prefers-reduced-motion") && media.reduced);
  return {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  };
}

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

class ResizeObserverMock implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

/** O teste do pré-render roda em ambiente Node (sem DOM). */
const isDom = typeof window !== "undefined";

function installBrowserMocks() {
  if (!isDom) return;
  vi.stubGlobal("matchMedia", vi.fn(matchMediaMock));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ available: false })));
  window.scrollTo = vi.fn() as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  // jsdom não implementa <dialog> modal nem mídia.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
  HTMLMediaElement.prototype.pause = vi.fn();
  HTMLMediaElement.prototype.load = vi.fn();
}

installBrowserMocks();
// Páginas são carregadas sob demanda (lazy); a primeira transformação no jsdom pode passar de 1 s.
configure({ asyncUtilTimeout: 15_000 });

beforeEach(() => {
  if (!isDom) return;
  media.hover = true;
  media.reduced = false;
  installBrowserMocks();
  localStorage.clear();
  sessionStorage.clear();
  // A abertura (boot) só aparece na primeira visita da sessão; nos testes, já foi vista.
  sessionStorage.setItem("nasck-boot", "1");
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.dataset.motion = "full";
  history.replaceState(null, "", "/");
  reloadPrefs();
});

afterEach(() => {
  if (isDom) cleanup();
  vi.useRealTimers();
});
