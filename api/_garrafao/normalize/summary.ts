import { arr, at, httpUrl, num, obj, str } from "../json.js";
import type { GameDetail, GameLeader, TeamLeaders } from "../types.js";
import { normalizeGame } from "./game.js";

function leader(categoryRaw: unknown): GameLeader | null {
  const category = obj(categoryRaw);
  const top = obj(arr(category.leaders)[0]);
  const athlete = obj(top.athlete);
  const name = str(athlete.displayName) ?? str(athlete.fullName);
  const value = str(top.displayValue);
  const key = str(category.name);
  if (!name || !value || !key) return null;
  return {
    category: key,
    value,
    athleteId: str(athlete.id),
    name,
    shortName: str(athlete.shortName) ?? name,
    headshot: httpUrl(at(athlete, "headshot", "href")) ?? httpUrl(athlete.headshot),
  };
}

export function normalizeSummary(raw: unknown): GameDetail | null {
  const summary = obj(raw);
  const game = normalizeGame(summary.header);
  if (!game) return null;
  const leaders: TeamLeaders[] = arr(summary.leaders)
    .map(obj)
    .map((entry) => ({
      teamId: str(at(entry, "team", "id")) ?? "",
      teamAbbr: (str(at(entry, "team", "abbreviation")) ?? "").toUpperCase(),
      leaders: arr(entry.leaders)
        .map(leader)
        .filter((item): item is GameLeader => item !== null),
    }))
    .filter((entry) => entry.teamId !== "" && entry.leaders.length > 0);
  return {
    game: { ...game, venue: game.venue ?? str(at(summary, "gameInfo", "venue", "fullName")) },
    leaders,
    attendance: num(at(summary, "gameInfo", "attendance")),
  };
}
