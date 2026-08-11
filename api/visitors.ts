interface RequestLike {
  method?: string;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseLike;
  json(body: VisitorApiResponse): void;
}

export type VisitorApiResponse =
  | {
      available: true;
      visitors: number;
      pageviews: number;
      updatedAt: string;
    }
  | {
      available: false;
    };

interface VercelAnalyticsPayload {
  data?: {
    visitors?: unknown;
    pageviews?: unknown;
  };
}

const ANALYTICS_ENDPOINT = "https://api.vercel.com/v1/query/web-analytics/visits/count";
const REQUEST_TIMEOUT_MS = 5_000;

function isValidCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function setSharedHeaders(response: ResponseLike) {
  response.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=3600");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

function unavailable(response: ResponseLike) {
  setSharedHeaders(response);
  return response.status(200).json({ available: false });
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ available: false });
  }

  if (process.env.VERCEL_ENV !== "production") {
    return unavailable(response);
  }

  const token = process.env.ANALYTICS_API_TOKEN;
  const projectId = process.env.ANALYTICS_PROJECT_ID;
  const teamId = process.env.ANALYTICS_TEAM_ID;

  if (!token || !projectId) {
    return unavailable(response);
  }

  const url = new URL(ANALYTICS_ENDPOINT);
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("filter", "requestPath eq '/'");
  if (teamId) url.searchParams.set("teamId", teamId);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const analyticsResponse = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!analyticsResponse.ok) {
      return unavailable(response);
    }

    const payload = (await analyticsResponse.json()) as VercelAnalyticsPayload;
    const visitors = payload.data?.visitors;
    const pageviews = payload.data?.pageviews;

    if (!isValidCount(visitors) || !isValidCount(pageviews)) {
      return unavailable(response);
    }

    setSharedHeaders(response);
    return response.status(200).json({
      available: true,
      visitors: Math.floor(visitors),
      pageviews: Math.floor(pageviews),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return unavailable(response);
  } finally {
    clearTimeout(timeout);
  }
}
