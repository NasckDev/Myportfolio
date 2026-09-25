import { useCallback, useEffect, useRef, useState } from "react";
import { readStorage, writeStorage } from "@/lib/clipboard";

export type Vote = "up" | "down" | null;

type VisitsPayload = { available: true; visits: number } | { available: false };
type VotesPayload = { available: true; likes: number; dislikes: number; vote: Vote } | { available: false; reason?: string };

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const asVote = (v: unknown): Vote => (v === "up" || v === "down" ? v : null);

async function callApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) } });
    if (!res.headers.get("content-type")?.includes("application/json")) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
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

  useEffect(() => {
    let dead = false;
    callApi<VotesPayload>("/api/votes").then((data) => {
      if (dead || !data || !data.available) return;
      const vote = asVote(data.vote);
      writeStorage("adn4-vote", vote);
      setState({ likes: data.likes, dislikes: data.dislikes, vote, remote: true });
    });
    return () => {
      dead = true;
    };
  }, []);

  const setVote = useCallback((next: Vote) => {
    const prev = stateRef.current;
    writeStorage("adn4-vote", next);
    setState(applyVote(prev, next));
    if (!prev.remote) return;
    const id = ++seq.current;
    callApi<VotesPayload>("/api/votes", { method: "POST", body: JSON.stringify({ vote: next }) }).then((data) => {
      if (id !== seq.current) return;
      if (data && data.available) {
        const vote = asVote(data.vote);
        writeStorage("adn4-vote", vote);
        setState({ likes: data.likes, dislikes: data.dislikes, vote, remote: true });
      } else {
        writeStorage("adn4-vote", prev.vote);
        setState(prev);
      }
    });
  }, []);

  return { ...state, setVote };
}
