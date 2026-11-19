export type Theme = "light" | "dark";

/**
 * Estado mutável lido pelas cenas three.js e pelos efeitos de scroll.
 * Fica fora do React para não provocar re-render a cada movimento de mouse ou scroll.
 */
export const live = {
  theme: "light" as Theme,
  motion: true,
  scrollY: 0,
  mouse: { x: 0, y: 0, in: false },
  xpP: 0,
  xpIdx: 0,
  mailHover: false,
  sendT: 0,
  hero3dReady: false,
};

type FrameFn = (t: number) => void;

/**
 * Loop único de requestAnimationFrame com dois tipos de assinante:
 * - `onFrame`: animação contínua (roda todo frame enquanto registrado e, se tiver
 *   elemento, enquanto ele estiver visível);
 * - `onScrollFrame`: reativo (só roda nos frames em que o scroll mudou ou alguém chamou `wake`).
 * Sem assinante contínuo ativo e sem mudança por alguns frames, o loop dorme até o próximo
 * evento de scroll/resize ou `wake()`.
 */
const IDLE_FRAMES_BEFORE_SLEEP = 8;
const continuous = new Map<FrameFn, boolean>();
const reactive = new Set<FrameFn>();
let raf = 0;
let dirty = true;
let idleFrames = 0;
let awakeUntil = 0;
let listening = false;

const readScroll = () => (document.scrollingElement || document.documentElement).scrollTop;

function hasActiveContinuous() {
  for (const on of continuous.values()) if (on) return true;
  return false;
}

function tick(t: number) {
  raf = 0;
  const y = readScroll();
  if (y !== live.scrollY) {
    live.scrollY = y;
    dirty = true;
  }
  const forced = t < awakeUntil;
  if (dirty || forced) {
    dirty = false;
    idleFrames = 0;
    reactive.forEach((fn) => fn(t));
  } else idleFrames++;
  continuous.forEach((on, fn) => on && fn(t));
  if (hasActiveContinuous() || forced || idleFrames < IDLE_FRAMES_BEFORE_SLEEP) raf = requestAnimationFrame(tick);
}

function schedule() {
  if (!raf && typeof requestAnimationFrame !== "undefined") raf = requestAnimationFrame(tick);
}

/**
 * Acorda o loop: os assinantes reativos rodam no próximo frame e, se `ms` > 0,
 * continuam rodando todo frame por esse tempo (ex.: durante uma transição de layout).
 */
export function wake(ms = 0) {
  dirty = true;
  if (ms > 0 && typeof performance !== "undefined") awakeUntil = Math.max(awakeUntil, performance.now() + ms);
  schedule();
}

const onEvent = () => wake();

function syncListeners() {
  const need = continuous.size + reactive.size > 0;
  if (need === listening || typeof window === "undefined") return;
  listening = need;
  if (need) {
    window.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent, { passive: true });
  } else {
    window.removeEventListener("scroll", onEvent);
    window.removeEventListener("resize", onEvent);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
}

/**
 * Registra uma animação contínua no loop. Com `visibleOn`, só roda enquanto o elemento
 * estiver na tela (IntersectionObserver), deixando o loop dormir no resto da página.
 */
export function onFrame(fn: FrameFn, visibleOn?: Element | null): () => void {
  let io: IntersectionObserver | null = null;
  if (visibleOn && typeof IntersectionObserver !== "undefined") {
    continuous.set(fn, false);
    io = new IntersectionObserver((es) => {
      const on = es.some((e) => e.isIntersecting);
      continuous.set(fn, on);
      if (on) schedule();
    });
    io.observe(visibleOn);
  } else continuous.set(fn, true);
  syncListeners();
  schedule();
  return () => {
    io?.disconnect();
    continuous.delete(fn);
    syncListeners();
  };
}

/** Registra uma função que só roda nos frames em que o scroll mudou (ou após `wake`). */
export function onScrollFrame(fn: FrameFn): () => void {
  reactive.add(fn);
  syncListeners();
  wake();
  return () => {
    reactive.delete(fn);
    syncListeners();
  };
}

const styleCache = new WeakMap<Element, Record<string, string>>();

/** Escreve a propriedade CSS (kebab-case) só quando o valor muda, evitando invalidar estilo à toa. */
export function setStyle(el: HTMLElement | SVGElement | null | undefined, prop: string, value: string) {
  if (!el) return;
  let cache = styleCache.get(el);
  if (!cache) {
    cache = {};
    styleCache.set(el, cache);
  }
  if (cache[prop] === value) return;
  cache[prop] = value;
  el.style.setProperty(prop, value);
}

export const EASE = "cubic-bezier(.16,1,.3,1)";
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (x: number) => x * x * (3 - 2 * x);
export const isCoarse = () => typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
