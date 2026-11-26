import { useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

type VisitsPayload = { available: true; visits: number } | { available: false };

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** Sem resposta neste tempo, o contador fica oculto em vez de esperar. */
const API_TIMEOUT_MS = 5_000;

async function callApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(path, {
      ...init,
      signal: controller.signal,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    });
    if (!res.headers.get("content-type")?.includes("application/json")) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Registra a visita (uma vez por sessão) e devolve o total do servidor, ou null sem a API (dev, GitHub Pages, Redis desligado). */
export function useVisits() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let dead = false;
    const counted = readStorage("adn4-counted", "session") === "1";
    callApi<VisitsPayload>("/api/visits", { method: counted ? "GET" : "POST" }).then((data) => {
      if (dead) return;
      if (data && data.available && isCount(data.visits)) {
        writeStorage("adn4-counted", "1", "session");
        setVisits(data.visits);
      }
    });
    return () => {
      dead = true;
    };
  }, []);

  return visits;
}
