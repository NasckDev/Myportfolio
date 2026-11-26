import { arr, at, httpUrl, num, obj, str } from "../json.js";
import type { Athlete, AthleteStats, Roster, RosterPlayer, SearchHit, StatLine, TeamRef } from "../types.js";
import { normalizeTeamRef } from "./game.js";

/** "6' 6\"" -> 78 polegadas. */
export function parseHeight(display: unknown): number | null {
  const match = /(\d+)'\s*(\d+)?/.exec(str(display) ?? "");
  return match ? Number(match[1]) * 12 + Number(match[2] ?? 0) : null;
}

/** "2018: Rd 1, Pk 11 (CHA)" -> { year: 2018, round: 1, pick: 11 }. */
export function parseDraft(display: unknown): Athlete["draft"] {
  const match = /(\d{4}).*?Rd\s*(\d+).*?Pk\s*(\d+)/i.exec(str(display) ?? "");
  return match ? { year: Number(match[1]), round: Number(match[2]), pick: Number(match[3]) } : null;
}

function position(raw: unknown): Athlete["position"] {
  const pos = obj(raw);
  const abbr = str(pos.abbreviation);
  return abbr ? { abbr: abbr.toUpperCase(), name: str(pos.displayName) ?? str(pos.name) ?? abbr } : null;
}

function optionalTeam(raw: unknown): TeamRef | null {
  const team = normalizeTeamRef(raw);
  return team.tbd ? null : team;
}

export function normalizeAthlete(raw: unknown): Athlete | null {
  const athlete = obj(obj(raw).athlete ?? raw);
  const id = str(athlete.id);
  const name = str(athlete.displayName) ?? str(athlete.fullName);
  if (!id || !/^\d+$/.test(id) || !name) return null;
  const summaryStats = new Map(
    arr(at(athlete, "statsSummary", "statistics"))
      .map(obj)
      .map((stat) => [str(stat.name) ?? "", num(stat.value) ?? num(stat.displayValue)] as const),
  );
  const hasSummary = summaryStats.size > 0;
  return {
    id,
    name,
    first: str(athlete.firstName),
    last: str(athlete.lastName),
    jersey: str(athlete.jersey),
    position: position(athlete.position),
    team: optionalTeam(athlete.team),
    headshot: httpUrl(at(athlete, "headshot", "href")),
    heightIn: num(athlete.height) ?? parseHeight(athlete.displayHeight),
    weightLb: num(athlete.weight) ?? num(athlete.displayWeight),
    age: num(athlete.age),
    birthPlace: str(athlete.displayBirthPlace),
    college: str(at(athlete, "college", "name")),
    draft: parseDraft(athlete.displayDraft),
    experience: str(athlete.displayExperience),
    active: athlete.active !== false,
    summary: hasSummary
      ? {
          label: str(at(athlete, "statsSummary", "displayName")),
          pts: summaryStats.get("avgPoints") ?? null,
          reb: summaryStats.get("avgRebounds") ?? null,
          ast: summaryStats.get("avgAssists") ?? null,
          fg: summaryStats.get("fieldGoalPct") ?? null,
        }
      : null,
  };
}

/** Nome estável da ESPN (`names`) -> campo nosso. Os rótulos curtos (`labels`) servem de reserva. */
const STAT_KEYS: Record<string, keyof StatLine> = {
  gamesPlayed: "gp",
  GP: "gp",
  avgMinutes: "min",
  MIN: "min",
  avgPoints: "pts",
  PTS: "pts",
  avgRebounds: "reb",
  REB: "reb",
  avgAssists: "ast",
  AST: "ast",
  avgSteals: "stl",
  STL: "stl",
  avgBlocks: "blk",
  BLK: "blk",
  fieldGoalPct: "fg",
  "FG%": "fg",
  threePointPct: "tp",
  "3P%": "tp",
  freeThrowPct: "ft",
  "FT%": "ft",
  avgTurnovers: "tov",
  TO: "tov",
};

export const EMPTY_STATS: StatLine = {
  gp: null,
  min: null,
  pts: null,
  reb: null,
  ast: null,
  stl: null,
  blk: null,
  fg: null,
  tp: null,
  ft: null,
  tov: null,
};

function statLine(keys: unknown[], values: unknown[]): StatLine | null {
  const line: StatLine = { ...EMPTY_STATS };
  let found = 0;
  keys.forEach((key, index) => {
    const field = STAT_KEYS[str(key) ?? ""];
    const value = num(values[index]);
    if (field && value !== null) {
      line[field] = value;
      found += 1;
    }
  });
  return found > 0 ? line : null;
}

export function normalizeOverview(raw: unknown): AthleteStats | null {
  const statistics = obj(obj(raw).statistics);
  const names = arr(statistics.names);
  const keys = names.length > 0 ? names : arr(statistics.labels);
  const splits = arr(statistics.splits).map(obj);
  if (keys.length === 0 || splits.length === 0) return null;
  const pick = (pattern: RegExp) => {
    const split = splits.find((item) => pattern.test(str(item.displayName) ?? ""));
    return split ? statLine(keys, arr(split.stats)) : null;
  };
  const season = pick(/regular/i);
  const career = pick(/career/i);
  return season || career ? { season, career } : null;
}

export function normalizeSearch(raw: unknown): SearchHit[] {
  return arr(obj(raw).items)
    .map(obj)
    .filter((item) => str(item.type) === "player" && (str(item.league) === "nba" || str(item.defaultLeagueSlug) === "nba"))
    .map((item): SearchHit | null => {
      const id = str(item.id);
      const name = str(item.displayName);
      if (!id || !/^\d+$/.test(id) || !name) return null;
      const team = obj(at(item, "teamRelationships", 0, "core"));
      const pos = item.position;
      return {
        id,
        name,
        teamAbbr: str(team.abbreviation)?.toUpperCase() ?? null,
        position: typeof pos === "string" ? str(pos) : str(obj(pos).abbreviation),
        headshot: httpUrl(at(item, "headshot", "href")) ?? httpUrl(item.headshot),
      };
    })
    .filter((hit): hit is SearchHit => hit !== null);
}

export function normalizeRoster(raw: unknown): Roster | null {
  const data = obj(raw);
  const team = normalizeTeamRef(data.team);
  if (team.tbd) return null;
  const players = arr(data.athletes)
    .map(obj)
    .map((athlete): RosterPlayer | null => {
      const id = str(athlete.id);
      const name = str(athlete.displayName) ?? str(athlete.fullName);
      if (!id || !name) return null;
      return {
        id,
        name,
        jersey: str(athlete.jersey),
        position: str(at(athlete, "position", "abbreviation")),
        headshot: httpUrl(at(athlete, "headshot", "href")),
      };
    })
    .filter((player): player is RosterPlayer => player !== null);
  // O logo do elenco vem em `logo`; as cores em `color`/`alternateColor`, como nos outros endpoints.
  return { team: { ...team, logo: team.logo ?? httpUrl(obj(data.team).logo) }, players };
}

export function normalizeTeams(raw: unknown): TeamRef[] {
  return arr(at(raw, "sports", 0, "leagues", 0, "teams"))
    .map((entry) => normalizeTeamRef(obj(entry).team))
    .filter((team) => !team.tbd)
    .sort((a, b) => a.name.localeCompare(b.name));
}
