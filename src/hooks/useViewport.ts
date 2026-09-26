import { useEffect, useState } from "react";

export interface Viewport {
  w: number;
  vh: number;
  fine: boolean;
  mac: boolean;
}

function read(): Viewport {
  if (typeof window === "undefined") return { w: 1400, vh: 900, fine: true, mac: true };
  return {
    w: window.innerWidth,
    vh: window.innerHeight,
    fine: matchMedia("(pointer: fine)").matches,
    mac: /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
  };
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState(read);
  useEffect(() => {
    const onResize = () => setVp(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vp;
}
