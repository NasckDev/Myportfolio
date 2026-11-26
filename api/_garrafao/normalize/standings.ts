import { arr, at, num, obj, str } from "../json.js";
import type { ConferenceStandings, Standings, TeamStanding } from "../types.js";
import { normalizeTeamRef } from "./game.js";

function statMap(entry: Record<string, unknown>) {
  const byName = new Map<string, Record<string, unknown>>();
  for (const stat of arr(entry.stats).map(obj)) {
    const name = str(stat.name);
    if (name) byName.set(name, stat);
    const type = str(stat.type);
    if (type && !byName.has(type)) byName.set(type, stat);
  }
  return {
    value: (name: string) => num(byName.get(name)?.value),
    text: (name: string) => {
      const stat = byName.get(name);
      return stat ? str(stat.displayValue) ?? str(stat.summary) : null;
    },
  };
}

function teamStanding(raw: unknown): TeamStanding | null {
  const entry = obj(raw);
  const team = normalizeTeamRef(entry.team);
  if (team.tbd) return null;
  const stats = statMap(entry);
  const wins = stats.value("wins");
  const losses = stats.value("losses");
  if (wins === null || losses === null) return null;
  const gamesBehindText = stats.text("gamesBehind");
  return {
    team,
    seed: stats.value("playoffSeed"),
    wins,
    losses,
    pct: stats.value("winPercent"),
    // A fonte publica "-" para o líder: isso é zero jogo atrás, não ausência de dado.
    gamesBehind: gamesBehindText === "-" ? 0 : stats.value("gamesBehind"),
    streak: stats.text("streak"),
    lastTen: stats.text("lasttengames") ?? stats.text("Last Ten Games"),
    home: stats.text("home") ?? stats.text("Home"),
    road: stats.text("road") ?? stats.text("Road"),
    pointDiff: stats.value("pointDifferential"),
  };
}

function conferenceId(child: Record<string, unknown>): ConferenceStandings["id"] | null {
  const label = `${str(child.abbreviation) ?? ""} ${str(child.name) ?? ""}`.toLowerCase();
  if (label.includes("east")) return "east";
  if (label.includes("west")) return "west";
  return null;
}

const CONFERENCE_NAME: Record<ConferenceStandings["id"], string> = { east: "Conferência Leste", west: "Conferência Oeste" };

export function normalizeStandings(raw: unknown): Standings {
  const children = arr(obj(raw).children).map(obj);
  const conferences: ConferenceStandings[] = [];
  for (const child of children) {
    const id = conferenceId(child);
    if (!id) continue;
    const teams = arr(at(child, "standings", "entries"))
      .map(teamStanding)
      .filter((team): team is TeamStanding => team !== null)
      .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99) || (b.pct ?? 0) - (a.pct ?? 0));
    conferences.push({ id, name: CONFERENCE_NAME[id], teams });
  }
  conferences.sort((a, b) => (a.id === "east" ? -1 : 1) - (b.id === "east" ? -1 : 1));
  const season = str(at(children[0], "standings", "seasonDisplayName"));
  return { season, conferences };
}
