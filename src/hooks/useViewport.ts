import { useEffect, useState } from "react";

export interface Viewport {
  w: number;
  /**
   * Altura da janela. Só é atualizada quando cruza uma das faixas usadas pela UI
   * (VH_BANDS), para que a barra de endereço do celular aparecendo/sumindo durante o
   * scroll não re-renderize o app inteiro.
   */
  vh: number;
  fine: boolean;
  mac: boolean;
}

/** Limiares de altura consultados pelos componentes (ex.: Experience usa 620, 640 e 760). */
const VH_BANDS = [620, 640, 760] as const;
const band = (h: number) => VH_BANDS.filter((b) => h >= b).length;

function isMac(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.userAgent;
  return /Mac|iPhone|iPad|iOS/i.test(platform);
}

function read(): Viewport {
  if (typeof window === "undefined") return { w: 1400, vh: 900, fine: true, mac: true };
  return {
    w: window.innerWidth,
    vh: window.innerHeight,
    fine: matchMedia("(pointer: fine)").matches,
    mac: isMac(),
  };
}

/** Devolve o estado anterior quando nada relevante mudou, evitando re-render. */
function next(prev: Viewport): Viewport {
  const cur = read();
  const sameVh = band(cur.vh) === band(prev.vh);
  if (cur.w === prev.w && sameVh && cur.fine === prev.fine && cur.mac === prev.mac) return prev;
  return sameVh ? { ...cur, vh: prev.vh } : cur;
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState(read);
  useEffect(() => {
    const onResize = () => setVp(next);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vp;
}
