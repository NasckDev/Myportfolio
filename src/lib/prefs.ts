import { useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "./storage";

/** Cores de destaque do painel Aparência: [cor, texto sobre a cor, nome]. Todas passam AA (4,5:1). */
export const ACCENTS = {
  laranja: ["#FF5A12", "#140700", "Laranja"],
  lima: ["#C8F135", "#141A00", "Lima"],
  ambar: ["#FFB31A", "#1A1000", "Âmbar"],
  vermelho: ["#E5252C", "#FFFFFF", "Vermelho"],
  cobalto: ["#2D5BFF", "#FFFFFF", "Cobalto"],
} as const satisfies Record<string, readonly [string, string, string]>;

export type AccentKey = keyof typeof ACCENTS;

export interface Prefs {
  theme: "auto" | "light" | "dark";
  accent: AccentKey;
  corners: "round" | "square";
  motion: "auto" | "full" | "reduced";
  plist: "grid" | "list";
}

export const DEFAULT_PREFS: Prefs = { theme: "auto", accent: "laranja", corners: "round", motion: "auto", plist: "grid" };
export const PREFS_KEY = "nasck-prefs";

const ALLOWED: { [K in keyof Prefs]: readonly Prefs[K][] } = {
  theme: ["auto", "light", "dark"],
  accent: Object.keys(ACCENTS) as AccentKey[],
  corners: ["round", "square"],
  motion: ["auto", "full", "reduced"],
  plist: ["grid", "list"],
};

/** Lê as preferências salvas, descartando valores fora da lista. */
export function loadPrefs(): Prefs {
  const out: Prefs = { ...DEFAULT_PREFS };
  try {
    const raw = JSON.parse(readStorage(PREFS_KEY) ?? "null") as Partial<Record<keyof Prefs, unknown>> | null;
    if (raw && typeof raw === "object") {
      for (const k of Object.keys(ALLOWED) as (keyof Prefs)[]) {
        const v = raw[k];
        if ((ALLOWED[k] as readonly unknown[]).includes(v)) (out as unknown as Record<string, unknown>)[k] = v;
      }
    }
  } catch {
    /* JSON inválido: padrão */
  }
  return out;
}

const reducedQuery = () =>
  typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

export const systemWantsLessMotion = (): boolean => reducedQuery()?.matches ?? false;

/** Aplica as preferências como atributos e variáveis no <html> (design tokens). */
export function applyPrefs(p: Prefs, root: HTMLElement = document.documentElement): void {
  if (p.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", p.theme);
  const [c, on] = ACCENTS[p.accent];
  root.style.setProperty("--accent", c);
  root.style.setProperty("--on-accent", on);
  root.style.setProperty("--round", p.corners === "square" ? ".16" : "1");
  root.style.setProperty("--pill", p.corners === "square" ? "5px" : "999px");
  root.dataset.motion = p.motion === "reduced" || (p.motion === "auto" && systemWantsLessMotion()) ? "soft" : "full";
}

let state: Prefs = loadPrefs();
const listeners = new Set<() => void>();

export function getPrefs(): Prefs {
  return state;
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void {
  state = { ...state, [key]: value };
  applyPrefs(state);
  writeStorage(PREFS_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function resetPrefs(): void {
  state = { ...DEFAULT_PREFS };
  applyPrefs(state);
  writeStorage(PREFS_KEY, null);
  listeners.forEach((l) => l());
}

/** Relê do armazenamento (usado nos testes e ao iniciar). */
export function reloadPrefs(): void {
  state = loadPrefs();
  applyPrefs(state);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const mq = reducedQuery();
  const onSystem = () => {
    applyPrefs(state);
    l();
  };
  mq?.addEventListener?.("change", onSystem);
  return () => {
    listeners.delete(l);
    mq?.removeEventListener?.("change", onSystem);
  };
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, getPrefs);
}

/** Tema efetivo (resolvendo "automático" pelo sistema). */
export function effectiveDark(): boolean {
  return getComputedStyle(document.documentElement).colorScheme.includes("dark");
}
