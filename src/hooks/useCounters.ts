import { useCallback, useEffect, useRef, useState } from "react";
import { readStorage, writeStorage } from "@/lib/clipboard";

export type Vote = "up" | "down" | null;

type VisitsPayload = { available: true; visits: number } | { available: false };
type VotesPayload = { available: true; likes: number; dislikes: number; vote: Vote } | { available: false; reason?: string };

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const asVote = (v: unknown): Vote => (v === "up" || v === "down" ? v : null);

/** Sem resposta neste tempo, o rodapé segue no modo local em vez de ficar esperando. */
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

/** Resposta de votos válida: disponível e com contagens numéricas não negativas. */
function validVotes(data: VotesPayload | null): data is Extract<VotesPayload, { available: true }> {
  return !!data && data.available && isCount(data.likes) && isCount(data.dislikes);
}

/** Contador local do handoff, usado quando a API não está disponível (dev, GitHub Pages, Redis desligado). */
function localVisits() {
  let v = Number(readStorage("adn4-visits") || 0);
  if (!readStorage("adn4-seen", "session")) {
    v += 1;
    writeStorage("adn4-visits", String(v));
    writeStorage("adn4-seen", "1", "session");
  }
  return Math.max(1, v);
}

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
      } else setVisits(localVisits());
    });
    return () => {
      dead = true;
    };
  }, []);

  return visits;
}

interface VotesState {
  likes: number;
  dislikes: number;
  vote: Vote;
  remote: boolean;
}

function applyVote(s: VotesState, next: Vote): VotesState {
  let { likes, dislikes } = s;
  if (s.vote === "up") likes = Math.max(0, likes - 1);
  if (s.vote === "down") dislikes = Math.max(0, dislikes - 1);
  if (next === "up") likes += 1;
  if (next === "down") dislikes += 1;
  return { ...s, likes, dislikes, vote: next };
}

export function useVotes() {
  const [state, setState] = useState<VotesState>(() => {
    const vote = asVote(readStorage("adn4-vote"));
    return { likes: vote === "up" ? 1 : 0, dislikes: vote === "down" ? 1 : 0, vote, remote: false };
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const seq = useRef(0);
  /** Voto dado antes de a API responder; é enviado assim que ela confirmar que está no ar. */
  const pending = useRef<{ vote: Vote } | null>(null);
  const loaded = useRef(false);

  const send = useCallback((next: Vote, prev: VotesState) => {
    const id = ++seq.current;
    callApi<VotesPayload>("/api/votes", { method: "POST", body: JSON.stringify({ vote: next }) }).then((data) => {
      if (id !== seq.current) return;
      if (validVotes(data)) {
        const vote = asVote(data.vote);
        writeStorage("adn4-vote", vote);
        setState({ likes: data.likes, dislikes: data.dislikes, vote, remote: true });
      } else {
        writeStorage("adn4-vote", prev.vote);
        setState(prev);
      }
    });
  }, []);

  useEffect(() => {
    let dead = false;
    callApi<VotesPayload>("/api/votes").then((data) => {
      if (dead) return;
      loaded.current = true;
      const queued = pending.current;
      pending.current = null;
      if (!validVotes(data)) return;
      const server: VotesState = { likes: data.likes, dislikes: data.dislikes, vote: asVote(data.vote), remote: true };
      if (queued && queued.vote !== server.vote) {
        writeStorage("adn4-vote", queued.vote);
        setState(applyVote(server, queued.vote));
        send(queued.vote, server);
        return;
      }
      writeStorage("adn4-vote", server.vote);
      setState(server);
    });
    return () => {
      dead = true;
    };
  }, [send]);

  const setVote = useCallback(
    (next: Vote) => {
      const prev = stateRef.current;
      writeStorage("adn4-vote", next);
      setState(applyVote(prev, next));
      if (prev.remote) send(next, prev);
      else if (!loaded.current) pending.current = { vote: next };
    },
    [send],
  );

  return { ...state, setVote };
}
