export type Theme = "light" | "dark";

/**
 * Estado mutável lido a cada frame pelas cenas three.js e pelos efeitos de scroll.
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
const subscribers = new Set<FrameFn>();
let raf = 0;

function tick(t: number) {
  raf = requestAnimationFrame(tick);
  const se = document.scrollingElement || document.documentElement;
  live.scrollY = se.scrollTop;
  subscribers.forEach((fn) => fn(t));
}

/** Registra uma função no loop único de requestAnimationFrame. */
export function onFrame(fn: FrameFn) {
  subscribers.add(fn);
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

export const EASE = "cubic-bezier(.16,1,.3,1)";
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (x: number) => x * x * (3 - 2 * x);
export const isCoarse = () => typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
