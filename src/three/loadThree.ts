import type * as ThreeNS from "three";

let promise: Promise<typeof ThreeNS> | null = null;

/** three.js é carregado sob demanda para não pesar o primeiro carregamento. */
export function loadThree() {
  if (!promise) promise = import("three");
  return promise;
}
