import type * as ThreeNS from "three";

let promise: Promise<typeof ThreeNS> | null = null;

/** three.js é carregado sob demanda para não pesar o primeiro carregamento. */
export function loadThree() {
  if (!promise) promise = import("three");
  return promise;
}

/**
 * Chama `cb` uma vez quando o elemento chega perto da viewport. Adia a montagem das cenas
 * 3D fora do topo para não disputar a thread principal com o loader e a entrada do hero.
 */
export function whenNear(el: Element, cb: () => void, rootMargin = "100% 0px") {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      cb();
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}
