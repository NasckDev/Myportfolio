import { arr, at, hexColor, httpUrl, num, obj, str } from "../json.js";
import type { Game, GameCompetitor, GameKind, GameState, GameStatus, Scoreboard, TeamRef } from "../types.js";

const TBD_TEAM: TeamRef = {
  id: "0",
  abbr: "A definir",
  name: "A definir",
  shortName: "A definir",
  logo: null,
  color: null,
  altColor: null,
  tbd: true,
};

/** Logo padrão: aceita `logo` (string) ou a lista `logos` (prefere a marcada como default). */
function teamLogo(team: Record<string, unknown>): string | null {
  const direct = httpUrl(team.logo);
  if (direct) return direct;
  const logos = arr(team.logos).map(obj);
  const preferred = logos.find((logo) => arr(logo.rel).includes("default")) ?? logos[0];
  return preferred ? httpUrl(preferred.href) : null;
}

export function normalizeTeamRef(raw: unknown): TeamRef {
  const team = obj(raw);
  const id = str(team.id);
  const abbr = str(team.abbreviation);
  if (!id || !abbr || id.startsWith("-") || abbr === "TBD") return TBD_TEAM;
  const name = str(team.displayName) ?? str(team.name) ?? abbr;
  return {
    id,
    abbr: abbr.toUpperCase(),
    name,
    shortName: str(team.shortDisplayName) ?? str(team.name) ?? name,
    logo: teamLogo(team),
    color: hexColor(team.color),
    altColor: hexColor(team.alternateColor),
    tbd: false,
  };
}

const STATES: ReadonlySet<string> = new Set(["pre", "in", "post"]);

/** Traduz o código de status da ESPN para um estado nosso; o texto exibido é montado no cliente, em pt-BR. */
function gameStatus(name: string | null, state: GameState): GameStatus {
  switch (name) {
    case "STATUS_SCHEDULED":
      return "scheduled";
    case "STATUS_IN_PROGRESS":
      return "live";
    case "STATUS_HALFTIME":
      return "halftime";
    case "STATUS_END_PERIOD":
      return "end-period";
    case "STATUS_FINAL":
    case "STATUS_FINAL_OVERTIME":
      return "final";
    case "STATUS_POSTPONED":
      return "postponed";
    case "STATUS_CANCELED":
    case "STATUS_FORFEIT":
      return "canceled";
    case "STATUS_DELAYED":
    case "STATUS_RAIN_DELAY":
      return "delayed";
    default:
      return state === "in" ? "live" : state === "post" ? "final" : state === "pre" ? "scheduled" : "unknown";
  }
}

function gameKind(competitionType: string | null, note: string | null, seasonSlug: string | null): GameKind {
  if (competitionType === "ALLSTAR" || /all-star/i.test(note ?? "")) return "allstar";
  if (competitionType === "CC" || /nba cup/i.test(note ?? "")) return "cup";
  if (seasonSlug === "preseason") return "preseason";
  if (seasonSlug === "play-in-season") return "playin";
  if (seasonSlug === "post-season") return "playoffs";
  return "regular";
}

function competitor(raw: unknown): GameCompetitor {
  const c = obj(raw);
  const records = arr(c.records ?? c.record).map(obj);
  const total = records.find((r) => r.type === "total" || r.name === "overall") ?? records[0];
  return {
    team: normalizeTeamRef(c.team),
    homeAway: c.homeAway === "away" ? "away" : "home",
    score: num(c.score),
    linescores: arr(c.linescores)
      .map((line) => num(obj(line).value) ?? num(obj(line).displayValue))
      .filter((value): value is number => value !== null),
    winner: c.winner === true,
    record: total ? str(total.summary) ?? str(total.displayValue) : null,
  };
}

/**
 * Normaliza um evento. Aceita tanto o item do placar (`scoreboard.events[]`) quanto o
 * cabeçalho do resumo (`summary.header`), que trazem o mesmo núcleo com pequenas diferenças.
 */
export function normalizeGame(raw: unknown): Game | null {
  const event = obj(raw);
  const competition = obj(arr(event.competitions)[0]);
  const id = str(event.id) ?? str(competition.id);
  const date = str(competition.date) ?? str(event.date);
  const competitors = arr(competition.competitors).map(competitor);
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!id || !date || !home || !away) return null;

  const status = obj(event.status ?? competition.status);
  const type = obj(status.type);
  const rawState = str(type.state);
  const state: GameState = rawState && STATES.has(rawState) ? (rawState as GameState) : "pre";
  const note = str(at(competition, "notes", 0, "headline"));
  const seasonSlug = str(at(event, "season", "slug"));
  const statusValue = gameStatus(str(type.name), state);

  return {
    id,
    date,
    timeValid: competition.timeValid !== false && event.timeValid !== false,
    state,
    status: statusValue,
    period: num(status.period) ?? 0,
    clock: state === "in" ? str(status.displayClock) : null,
    detail: str(type.shortDetail) ?? str(type.detail) ?? "",
    kind: gameKind(str(at(competition, "type", "abbreviation")), note, seasonSlug),
    note,
    venue: str(at(competition, "venue", "fullName")),
    home,
    away,
  };
}

export function normalizeScoreboard(raw: unknown, date: string): Scoreboard {
  const games = arr(obj(raw).events)
    .map(normalizeGame)
    .filter((game): game is Game => game !== null)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return { date, games, hasLive: games.some((game) => game.state === "in") };
}

/** Lista de jogos de um mês inteiro (usada para achar NBA Cup e All-Star no calendário). */
export function normalizeGameList(raw: unknown): Game[] {
  return arr(obj(raw).events)
    .map(normalizeGame)
    .filter((game): game is Game => game !== null);
}
