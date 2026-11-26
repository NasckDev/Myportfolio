import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { EMAIL } from "@/data/site";
import { copyText } from "@/lib/storage";

export interface LightboxItem {
  src: string;
  caption: string;
}

type Panel = "palette" | "appearance" | "more" | null;

interface UiValue {
  panel: Panel;
  openPanel: (p: Exclude<Panel, null>) => void;
  togglePanel: (p: Exclude<Panel, null>) => void;
  closePanel: () => void;
  toastMsg: string;
  toastOn: boolean;
  toast: (msg: string) => void;
  copy: (text: string, ok: string) => Promise<void>;
  copyEmail: () => void;
  lightbox: { items: LightboxItem[]; index: number } | null;
  openLightbox: (items: LightboxItem[], index: number) => void;
  closeLightbox: () => void;
}

const UiContext = createContext<UiValue | null>(null);

const TOAST_MS = 2600;

export function UiProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [lightbox, setLightbox] = useState<UiValue["lightbox"]>(null);
  const timer = useRef(0);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastOn(false), TOAST_MS);
  }, []);

  const copy = useCallback(
    async (text: string, ok: string) => {
      const done = await copyText(text);
      toast(done ? ok : `Não deu para copiar. Selecione e copie: ${text}`);
    },
    [toast],
  );

  const value = useMemo<UiValue>(
    () => ({
      panel,
      openPanel: (p) => setPanel(p),
      togglePanel: (p) => setPanel((cur) => (cur === p ? null : p)),
      closePanel: () => setPanel(null),
      toastMsg,
      toastOn,
      toast,
      copy,
      copyEmail: () => void copy(EMAIL, "E-mail copiado"),
      lightbox,
      openLightbox: (items, index) => setLightbox({ items, index }),
      closeLightbox: () => setLightbox(null),
    }),
    [panel, toastMsg, toastOn, toast, copy, lightbox],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi precisa de <UiProvider>");
  return ctx;
}
