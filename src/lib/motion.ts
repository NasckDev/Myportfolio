/** Movimento suave: preferência "Suave" do painel Aparência ou prefers-reduced-motion no modo automático. */
export const isSoftMotion = (): boolean => document.documentElement.dataset.motion === "soft";

/** Comportamento de rolagem que respeita o movimento suave. */
export const scrollBehavior = (): ScrollBehavior => (isSoftMotion() ? "auto" : "smooth");

/** Dispositivo com mouse de verdade (prévias em vídeo e "peek" só fazem sentido aqui). */
export const canHover = (): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
