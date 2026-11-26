import { fetchJson, ORIGIN_TIMEOUT_MS, OriginError, type FetchLike } from "./fetch-json.js";
import { originUrl } from "./origin.js";
import { normalizeAthlete, normalizeOverview, normalizeRoster, normalizeSearch, normalizeTeams } from "./normalize/athlete.js";
import { normalizeGameList, normalizeScoreboard } from "./normalize/game.js";
import { normalizeNews } from "./normalize/news.js";
import { buildSeasonEvents, normalizeDraft, normalizeSeason, seasonMonths } from "./normalize/season.js";
import { normalizeStandings } from "./normalize/standings.js";
import { normalizeSummary } from "./normalize/summary.js";
import type { Game, PlayerProfile } from "./types.js";
import { dateParam, idListParam, idParam, searchParam, teamIdParam, yearParam, type Query } from "./validate.js";

/** Tempo de cache na CDN (s-maxage) e janela em que a CDN serve o antigo enquanto revalida (stale-while-revalidate). */
export interface CachePolicy {
  sMaxAge: number;
  swr: number;
}

export interface OpContext {
  fetch: FetchLike;
  now: Date;
}

export interface OpResult {
  body: unknown;
  cache: CachePolicy;
}

interface Operation {
  params: readonly string[];
  run(query: Query, ctx: OpContext): Promise<OpResult>;
}

/** Resposta da origem que não tem o formato esperado: tratada como falha de origem (502). */
export class UnexpectedPayload extends OriginError {
  constructor() {
    super("payload");
  }
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const CACHE = {
  live: { sMaxAge: 15, swr: 30 },
  today: { sMaxAge: MINUTE, swr: 2 * MINUTE },
  pastDay: { sMaxAge: HOUR, swr: DAY },
  pregame: { sMaxAge: 5 * MINUTE, swr: 10 * MINUTE },
  standings: { sMaxAge: 5 * MINUTE, swr: 15 * MINUTE },
  news: { sMaxAge: 10 * MINUTE, swr: 30 * MINUTE },
  stats: { sMaxAge: 15 * MINUTE, swr: HOUR },
  profile: { sMaxAge: HOUR, swr: DAY },
  static: { sMaxAge: DAY, swr: 7 * DAY },
  events: { sMaxAge: 6 * HOUR, swr: DAY },
  partial: { sMaxAge: 5 * MINUTE, swr: 10 * MINUTE },
} as const satisfies Record<string, CachePolicy>;

function expect<T>(value: T | null): T {
  if (value === null) throw new UnexpectedPayload();
  return value;
}

/** Dia (YYYYMMDD) em Nova York: é o "dia da rodada" que a ESPN usa no parâmetro `dates`. */
export function leagueDay(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return parts.replace(/-/g, "");
}

/** Executa tarefas com limite de concorrência e prazo total; o que não termina a tempo conta como falha. */
async function settleLimited<T>(items: readonly string[], limit: number, task: (item: string) => Promise<T>): Promise<(T | null)[]> {
  const results: (T | null)[] = new Array(items.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = await task(items[index]);
      } catch {
        results[index] = null;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Perfil + médias. A falha só das médias não derruba o perfil: devolve `stats: null`. */
async function playerProfile(ctx: OpContext, id: string): Promise<PlayerProfile> {
  const [athleteRaw, overviewRaw] = await Promise.all([
    fetchJson(ctx.fetch, originUrl.athlete(id)),
    fetchJson(ctx.fetch, originUrl.overview(id)).catch(() => null),
  ]);
  return { athlete: expect(normalizeAthlete(athleteRaw)), stats: overviewRaw === null ? null : normalizeOverview(overviewRaw) };
}

const PLAYERS_CONCURRENCY = 6;
const MONTHS_CONCURRENCY = 5;

export const OPERATIONS: Record<string, Operation> = {
  scoreboard: {
    params: ["date"],
    async run(query, ctx) {
      const date = dateParam(query, ctx.now);
      const board = normalizeScoreboard(await fetchJson(ctx.fetch, originUrl.scoreboardDay(date)), date);
      const today = leagueDay(ctx.now);
      const settled = board.games.every((game) => game.state === "post" || game.status === "postponed" || game.status === "canceled");
      const cache = board.hasLive ? CACHE.live : date < today && settled ? CACHE.pastDay : date === today ? CACHE.today : CACHE.pregame;
      return { body: board, cache };
    },
  },
  summary: {
    params: ["event"],
    async run(query, ctx) {
      const detail = expect(normalizeSummary(await fetchJson(ctx.fetch, originUrl.summary(idParam(query, "event")))));
      const state = detail.game.state;
      return { body: detail, cache: state === "in" ? CACHE.live : state === "post" ? CACHE.pastDay : CACHE.pregame };
    },
  },
  standings: {
    params: [],
    async run(_query, ctx) {
      const standings = normalizeStandings(await fetchJson(ctx.fetch, originUrl.standings()));
      if (standings.conferences.length === 0) throw new UnexpectedPayload();
      return { body: standings, cache: CACHE.standings };
    },
  },
  news: {
    params: [],
    async run(_query, ctx) {
      return { body: normalizeNews(await fetchJson(ctx.fetch, originUrl.news())), cache: CACHE.news };
    },
  },
  teams: {
    params: [],
    async run(_query, ctx) {
      const teams = normalizeTeams(await fetchJson(ctx.fetch, originUrl.teams()));
      if (teams.length === 0) throw new UnexpectedPayload();
      return { body: teams, cache: CACHE.static };
    },
  },
  roster: {
    params: ["team"],
    async run(query, ctx) {
      const roster = expect(normalizeRoster(await fetchJson(ctx.fetch, originUrl.roster(teamIdParam(query)))));
      return { body: roster, cache: CACHE.profile };
    },
  },
  athlete: {
    params: ["id"],
    async run(query, ctx) {
      return { body: expect(normalizeAthlete(await fetchJson(ctx.fetch, originUrl.athlete(idParam(query))))), cache: CACHE.profile };
    },
  },
  overview: {
    params: ["id"],
    async run(query, ctx) {
      const stats = normalizeOverview(await fetchJson(ctx.fetch, originUrl.overview(idParam(query))));
      return { body: stats ?? { season: null, career: null }, cache: CACHE.stats };
    },
  },
  players: {
    params: ["ids"],
    async run(query, ctx) {
      const ids = idListParam(query);
      const profiles = await settleLimited(ids, PLAYERS_CONCURRENCY, (id) => playerProfile(ctx, id));
      const players = profiles.filter((profile): profile is PlayerProfile => profile !== null);
      const missing = ids.filter((_, index) => profiles[index] === null);
      if (players.length === 0) throw new OriginError("status");
      return { body: { players, missing }, cache: missing.length ? CACHE.partial : CACHE.stats };
    },
  },
  search: {
    params: ["q"],
    async run(query, ctx) {
      return { body: normalizeSearch(await fetchJson(ctx.fetch, originUrl.search(searchParam(query)))), cache: CACHE.profile };
    },
  },
  season: {
    params: ["year"],
    async run(query, ctx) {
      return { body: expect(normalizeSeason(await fetchJson(ctx.fetch, originUrl.season(yearParam(query, ctx.now))))), cache: CACHE.static };
    },
  },
  draft: {
    params: ["year"],
    async run(query, ctx) {
      const year = yearParam(query, ctx.now);
      const [core, site] = await Promise.all([
        fetchJson(ctx.fetch, originUrl.draftCore(year)),
        fetchJson(ctx.fetch, originUrl.draftSite(year)).catch(() => null),
      ]);
      const draft = expect(normalizeDraft(core, site));
      return { body: draft, cache: draft.state === "post" ? CACHE.static : CACHE.profile };
    },
  },
  events: {
    params: ["season"],
    async run(query, ctx) {
      const year = yearParam(query, ctx.now, "season");
      const [seasonRaw, cupTournament, cupSeason] = await Promise.all([
        fetchJson(ctx.fetch, originUrl.season(year)),
        fetchJson(ctx.fetch, originUrl.cupTournament()).catch(() => null),
        fetchJson(ctx.fetch, originUrl.cupSeason(year)).catch(() => null),
      ]);
      const season = expect(normalizeSeason(seasonRaw));
      const months = seasonMonths(season);
      const lists = await settleLimited(months, MONTHS_CONCURRENCY, async (month) =>
        normalizeGameList(await fetchJson(ctx.fetch, originUrl.scoreboardMonth(month), ORIGIN_TIMEOUT_MS + 2_000)),
      );
      const events = buildSeasonEvents({
        season,
        cupTournament,
        cupSeason,
        months: months.map((month, index) => ({ month, games: lists[index] as Game[] | null })),
      });
      return { body: events, cache: events.months.failed.length ? CACHE.partial : CACHE.events };
    },
  },
};

export type OperationName = keyof typeof OPERATIONS;
