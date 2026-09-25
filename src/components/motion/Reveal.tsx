import { createElement, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { EASE, isCoarse } from "@/lib/live";

export type RevealKind = "blur" | "word" | "slide" | "line" | "clip";

type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          observer?.unobserve(e.target);
          callbacks.get(e.target)?.();
          callbacks.delete(e.target);
        }),
      { threshold: 0.12 },
    );
  }
  return observer;
}

/** Executa `cb` uma única vez quando o elemento entra na viewport (threshold .12). */
export function observeOnce(el: Element, cb: Callback) {
  callbacks.set(el, cb);
  getObserver().observe(el);
  return () => {
    callbacks.delete(el);
    observer?.unobserve(el);
  };
}

function hide(el: HTMLElement, kind: RevealKind, delay: number) {
  const blur = (px: number) => (isCoarse() ? "none" : `blur(${px}px)`);
  el.style.transition = `transform .9s ${EASE} ${delay}ms, opacity .7s ${EASE} ${delay}ms, filter .8s ${EASE} ${delay}ms, clip-path 1.1s ${EASE} ${delay}ms`;
  if (kind === "blur") {
    el.style.opacity = "0";
    el.style.filter = blur(6);
    el.style.transform = "translate3d(0,18px,0)";
  } else if (kind === "word") {
    el.style.opacity = "0";
    el.style.filter = blur(10);
    el.style.transform = "translate3d(0,35%,0)";
  } else if (kind === "slide") {
    el.style.opacity = "0";
    el.style.filter = blur(4);
    el.style.transform = "translate3d(-20px,0,0)";
  } else if (kind === "line") {
    el.style.opacity = "0";
    el.style.transform = "translate3d(-12px,0,0)";
  } else if (kind === "clip") {
    el.style.clipPath = "inset(12% 12% 12% 12% round 28px)";
  }
}

function show(el: HTMLElement) {
  el.style.transform = "none";
  el.style.opacity = "";
  el.style.filter = "";
  el.style.clipPath = "";
}

/**
 * Animação de entrada ao rolar. O elemento não deve receber opacity/transform/filter
 * pelo React, pois esses valores são controlados aqui.
 */
export function useReveal<T extends HTMLElement>(kind: RevealKind = "blur", delay = 0, hero = false) {
  const ref = useRef<T>(null);
  const { motion, heroReady } = usePortfolio();
  const state = useRef<"idle" | "hidden" | "shown">("idle");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (state.current === "idle") {
      if (!motion || (hero && heroReady)) {
        state.current = "shown";
        return;
      }
      hide(el, kind, delay);
      state.current = "hidden";
    }
    // Observa a cada montagem (o StrictMode desmonta e remonta os efeitos em dev).
    if (state.current === "hidden" && !hero) {
      return observeOnce(el, () => {
        show(el);
        state.current = "shown";
      });
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || state.current !== "hidden") return;
    if (!motion) {
      el.style.transition = "none";
      show(el);
      state.current = "shown";
    } else if (hero && heroReady) {
      show(el);
      state.current = "shown";
    }
  }, [motion, hero, heroReady]);

  return ref;
}

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "p" | "h1" | "h2" | "h3" | "span" | "article" | "section" | "li";
  kind?: RevealKind;
  delay?: number;
  hero?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
};

export function Reveal({ as = "div", kind = "blur", delay = 0, hero = false, children, ...rest }: RevealProps) {
  const ref = useReveal<HTMLElement>(kind, delay, hero);
  return createElement(as, { ref, ...rest }, children);
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_-=#";

/** Texto que "embaralha" ao entrar na tela (rótulos de seção) ou é digitado (terminal). */
export function Scramble({ text, mode = "scramble", className, style }: { text: string; mode?: "scramble" | "type"; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { motion } = usePortfolio();
  const [out, setOut] = useState(text);
  const motionRef = useRef(motion);
  motionRef.current = motion;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const stop = observeOnce(el, () => {
      if (!motionRef.current) return;
      const type = mode === "type";
      const dur = type ? text.length * 40 : 650;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const n = Math.floor(text.length * p);
        let s = text.slice(0, n);
        if (!type) for (let i = n; i < text.length; i++) s += text[i] === " " ? " " : CHARS[(Math.random() * CHARS.length) | 0];
        setOut(p < 1 ? s : text);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, [text, mode]);

  return (
    <span ref={ref} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
