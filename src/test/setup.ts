import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { jsonResponse } from "./http";

/**
 * APIs de navegador que o jsdom não implementa e que o app usa ao montar.
 * Ficam no módulo de setup porque PortfolioContext lê matchMedia já na importação.
 */

/** Simula um desktop com mouse: só "(pointer: fine)" casa; nada de reduced-motion nem toque. */
function matchMediaMock(query: string): MediaQueryList {
  return {
    matches: query.includes("pointer: fine"),
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

function installBrowserMocks() {
  vi.stubGlobal("matchMedia", vi.fn(matchMediaMock));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("requestIdleCallback", vi.fn((cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0)));
  vi.stubGlobal("cancelIdleCallback", vi.fn((id: number) => window.clearTimeout(id)));
  // Por padrão a API de contadores está "fora do ar"; cada teste sobrescreve quando precisa.
  vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ available: false })));
  window.scrollTo = vi.fn() as typeof window.scrollTo;
  Element.prototype.scrollTo = vi.fn() as typeof Element.prototype.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
}

// Primeira instalação antes de qualquer import de teste (módulos que leem matchMedia no carregamento).
installBrowserMocks();

beforeEach(() => {
  installBrowserMocks();
  localStorage.clear();
  sessionStorage.clear();
  // O provider grava #case-<id> na URL e, ao montar, abre o case do hash: sem limpar, um teste reabre a gaveta do anterior.
  history.replaceState(null, "", "/");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
