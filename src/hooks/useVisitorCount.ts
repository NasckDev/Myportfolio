import { useEffect, useState } from "react";

type VisitorState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "available"; visitors: number; pageviews: number }
  | { status: "unavailable" };

interface VisitorResponse {
  available?: unknown;
  visitors?: unknown;
  pageviews?: unknown;
}

const analyticsEnabled =
  import.meta.env.PROD && import.meta.env.VITE_ENABLE_PROD_ANALYTICS === "true";

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function useVisitorCount(): VisitorState {
  const [state, setState] = useState<VisitorState>(() =>
    analyticsEnabled ? { status: "loading" } : { status: "disabled" },
  );

  useEffect(() => {
    if (!analyticsEnabled) return;

    const controller = new AbortController();

    async function loadVisitors() {
      try {
        const response = await fetch("/api/visitors", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          setState({ status: "unavailable" });
          return;
        }

        const payload = (await response.json()) as VisitorResponse;
        if (payload.available !== true || !isCount(payload.visitors) || !isCount(payload.pageviews)) {
          setState({ status: "unavailable" });
          return;
        }

        setState({
          status: "available",
          visitors: Math.floor(payload.visitors),
          pageviews: Math.floor(payload.pageviews),
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "unavailable" });
      }
    }

    void loadVisitors();
    return () => controller.abort();
  }, []);

  return state;
}
