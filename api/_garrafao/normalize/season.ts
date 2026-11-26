import { arr, at, httpUrl, num, obj, str } from "../json.js";
import type {
  DraftInfo,
  DraftPick,
  Game,
  GameState,
  SeasonEvent,
  SeasonEventStage,
  SeasonEvents,
  SeasonInfo,
  SeasonPhase,
  TeamRef,
} from "../types.js";
import { normalizeTeamRef } from "./game.js";

const PHASES: Record<string, { slug: SeasonPhase["slug"]; name: string }> = {
  preseason: { slug: "preseason", name: "Pré-temporada" },
  "regular-season": { slug: "regular", name: "Temporada regular" },
  "play-in-season": { slug: "playin", name: "Play-in" },
  "post-season": { slug: "playoffs", name: "Playoffs" },
  "off-season": { slug: "offseason", name: "Entressafra" },
};

export function normalizeSeason(raw: unknown): SeasonInfo | null {
  const season = obj(raw);
  const year = num(season.year);
  if (year === null) return null;
  const phases = arr(at(season, "types", "items"))
    .map(obj)
    .map((type): SeasonPhase => {
      const slug = str(type.slug) ?? "";
      const known = PHASES[slug];
      return {
        id: str(type.id) ?? slug,
        slug: known?.slug ?? "other",
        name: known?.name ?? str(type.name) ?? slug,
        start: str(type.startDate),
        end: str(type.endDate),
      };
    })
    .sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
  return {
    year,
    label: str(season.displayName) ?? `${year - 1}-${String(year).slice(2)}`,
    start: str(season.startDate),
    end: str(season.endDate),
    phases,
  };
}

/** Meses (YYYYMM) cobertos pela temporada, do início ao fim publicados pela fonte. */
export function seasonMonths(season: SeasonInfo): string[] {
  if (!season.start || !season.end) return [];
  const start = new Date(season.start);
  const end = new Date(season.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const months: string[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor <= end && months.length < 14) {
    months.push(`${cursor.getUTCFullYear()}${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

function draftState(value: unknown): GameState | null {
  const state = str(value);
  return state === "pre" || state === "in" || state === "post" ? state : null;
}

const DRAFT_STATUS: Record<string, string> = {
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Encerrado",
};

/**
 * Draft: datas, rodadas e situação vêm da API core; as escolhas (com nome do atleta,
 * já resolvido) vêm do endpoint `site/draft`, o mesmo que alimenta a página da ESPN.
 */
export function normalizeDraft(coreRaw: unknown, siteRaw: unknown): DraftInfo | null {
  const core = obj(coreRaw);
  const site = obj(siteRaw);
  const year = num(core.year) ?? num(site.year);
  if (year === null) return null;

  const teams = new Map<string, TeamRef>();
  for (const team of arr(site.teams).map(normalizeTeamRef)) if (!team.tbd) teams.set(team.id, team);
  const positions = new Map(arr(site.positions).map(obj).map((pos) => [str(pos.id) ?? "", str(pos.abbreviation)] as const));

  const picks = arr(site.picks)
    .map(obj)
    .map((pick): DraftPick | null => {
      const overall = num(pick.overall);
      const round = num(pick.round);
      const number = num(pick.pick);
      if (overall === null || round === null || number === null) return null;
      const athlete = obj(pick.athlete);
      const name = str(athlete.displayName);
      return {
        overall,
        round,
        pick: number,
        team: teams.get(str(pick.teamId) ?? "") ?? null,
        athlete: name
          ? {
              name,
              position: positions.get(str(at(athlete, "position", "id")) ?? "") ?? null,
              from: str(at(athlete, "team", "shortDisplayName")) ?? str(at(athlete, "team", "location")) ?? str(athlete.leagueAffiliation),
              headshot: httpUrl(at(athlete, "headshot", "href")),
            }
          : null,
        traded: pick.traded === true,
        tradeNote: str(pick.tradeNote),
      };
    })
    .filter((pick): pick is DraftPick => pick !== null)
    .sort((a, b) => a.overall - b.overall);

  const status = obj(site.status);
  const statusName = str(status.name);
  return {
    year,
    name: str(core.shortDisplayName) ?? str(site.shortDisplayName) ?? `${year} NBA Draft`,
    start: str(core.startDate),
    end: str(core.endDate),
    rounds: num(core.numberOfRounds) ?? num(site.rounds),
    state: draftState(status.state),
    statusText: statusName ? DRAFT_STATUS[statusName] ?? str(status.description) : null,
    picks,
  };
}

function stageOf(game: Game): SeasonEventStage | null {
  const note = game.note ?? "";
  if (game.kind === "allstar") return "allstar";
  if (game.kind !== "cup") return null;
  if (/quarter/i.test(note)) return "quarterfinal";
  if (/semi/i.test(note)) return "semifinal";
  if (/championship|final/i.test(note)) return "final";
  if (/group/i.test(note)) return "group";
  return null;
}

/**
 * Monta a aba de eventos só com o que a fonte publica: fases da temporada (core),
 * NBA Cup e All-Star identificados pelas notas oficiais dos jogos no calendário mês a mês.
 */
export function buildSeasonEvents(input: {
  season: SeasonInfo;
  cupTournament: unknown;
  cupSeason: unknown;
  months: { month: string; games: Game[] | null }[];
}): SeasonEvents {
  const events: SeasonEvent[] = [];
  const seen = new Set<string>();
  for (const { games } of input.months) {
    for (const game of games ?? []) {
      const stage = stageOf(game);
      if (!stage || seen.has(game.id)) continue;
      seen.add(game.id);
      events.push({ stage, label: game.note ?? "", game });
    }
  }
  events.sort((a, b) => a.game.date.localeCompare(b.game.date));
  const group = events.filter((event) => event.stage === "group");
  return {
    season: input.season,
    cup: {
      name: str(obj(input.cupTournament).displayName),
      rounds: num(obj(input.cupSeason).numberOfRounds),
      group: group.length
        ? { count: group.length, first: group[0].game.date, last: group[group.length - 1].game.date }
        : null,
      knockout: events.filter((event) => event.stage === "quarterfinal" || event.stage === "semifinal" || event.stage === "final"),
    },
    allStar: events.filter((event) => event.stage === "allstar"),
    months: {
      scanned: input.months.filter((month) => month.games !== null).map((month) => month.month),
      failed: input.months.filter((month) => month.games === null).map((month) => month.month),
    },
  };
}
