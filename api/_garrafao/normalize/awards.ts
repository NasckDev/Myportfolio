import { arr, at, httpUrl, num, obj, str } from "../json.js";
import type {
  Athlete,
  AthleteBrief,
  Award,
  AwardKey,
  FinalsResult,
  Game,
  LeaderCategory,
  LeaderCategoryKey,
  SeasonLeaders,
  TeamRef,
} from "../types.js";
import { normalizeTeamRef } from "./game.js";

/**
 * Prêmios individuais lidos na API core (`seasons/{ano}/awards/{id}`), ids conferidos em 27/11/2026.
 * Só prêmios de um vencedor: times ideais (All-NBA etc.) ficam de fora.
 */
export const AWARDS: readonly { id: string; key: AwardKey; name: string }[] = [
  { id: "33", key: "mvp", name: "MVP da temporada" },
  { id: "43", key: "finals-mvp", name: "MVP das Finais" },
  { id: "35", key: "roy", name: "Calouro do ano" },
  { id: "39", key: "dpoy", name: "Defensor do ano" },
  { id: "40", key: "sixth", name: "Sexto homem do ano" },
  { id: "36", key: "mip", name: "Jogador que mais evoluiu" },
  { id: "297", key: "clutch", name: "Jogador decisivo do ano" },
  { id: "377", key: "cup-mvp", name: "MVP da Copa NBA" },
  { id: "53", key: "allstar-mvp", name: "MVP do All-Star" },
];

/** Prêmio como a core publica: só referências ($ref) ao atleta e ao time, sem nome. */
export interface AwardRefs {
  sourceName: string | null;
  winners: { athleteId: string; teamId: string | null }[];
}

const refId = (ref: unknown, kind: "athletes" | "teams") => new RegExp(`/${kind}/(\\d+)`).exec(str(obj(ref).$ref) ?? "")?.[1] ?? null;

export function parseAwardRefs(raw: unknown): AwardRefs | null {
  const award = obj(raw);
  if (!str(award.id)) return null;
  const winners = arr(award.winners)
    .map(obj)
    .map((winner) => ({ athleteId: refId(winner.athlete, "athletes"), teamId: refId(winner.team, "teams") }))
    .filter((winner): winner is { athleteId: string; teamId: string | null } => winner.athleteId !== null);
  return { sourceName: str(award.name), winners };
}

export function athleteBrief(athlete: Athlete): AthleteBrief {
  return { id: athlete.id, name: athlete.name, headshot: athlete.headshot, position: athlete.position?.abbr ?? null };
}

/**
 * Junta as referências com os atletas e times já resolvidos. Prêmio cujo vencedor não pôde ser resolvido
 * devolve `null` (o chamador marca como falha parcial em vez de mostrar um vencedor sem nome).
 */
export function buildAward(
  def: { key: AwardKey; name: string },
  refs: AwardRefs,
  athletes: ReadonlyMap<string, AthleteBrief>,
  teams: ReadonlyMap<string, TeamRef>,
): Award | null {
  const winners = refs.winners.map((winner) => {
    const athlete = athletes.get(winner.athleteId);
    return athlete ? { athlete, team: winner.teamId ? teams.get(winner.teamId) ?? null : null } : null;
  });
  if (winners.length === 0 || winners.some((winner) => winner === null)) return null;
  return { key: def.key, name: def.name, sourceName: refs.sourceName, winners: winners as Award["winners"] };
}

/** A série final é melhor de 7 desde 1947: campeão é quem chega a 4 vitórias. */
const FINALS_WINS = 4;

/**
 * Campeão: jogos encerrados com a nota oficial "NBA Finals - Game N" no calendário dos meses finais dos playoffs.
 * Sem um time com 4 vitórias (série em andamento ou fora dos meses lidos), não há campeão a mostrar.
 */
export function findFinals(games: readonly Game[]): FinalsResult | null {
  const finals = games
    .filter((game) => game.state === "post" && /^NBA Finals\b/i.test(game.note ?? "") && !game.home.team.tbd && !game.away.team.tbd)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (finals.length === 0) return null;
  const teams = new Map<string, TeamRef>();
  const wins = new Map<string, number>();
  for (const game of finals) {
    for (const side of [game.home, game.away]) {
      teams.set(side.team.id, side.team);
      if (side.winner) wins.set(side.team.id, (wins.get(side.team.id) ?? 0) + 1);
    }
  }
  if (teams.size !== 2) return null;
  const [a, b] = [...teams.keys()];
  const championId = (wins.get(a) ?? 0) >= FINALS_WINS ? a : (wins.get(b) ?? 0) >= FINALS_WINS ? b : null;
  if (!championId) return null;
  const runnerUpId = championId === a ? b : a;
  return {
    champion: teams.get(championId) as TeamRef,
    runnerUp: teams.get(runnerUpId) as TeamRef,
    wins: wins.get(championId) ?? 0,
    losses: wins.get(runnerUpId) ?? 0,
    decidedAt: finals[finals.length - 1].date,
  };
}

/** Categorias de líderes mostradas, pelo nome estável da ESPN (`leaders.categories[].name`). */
const LEADER_CATEGORIES: readonly { source: string; key: LeaderCategoryKey; name: string }[] = [
  { source: "pointsPerGame", key: "pts", name: "Pontos por jogo" },
  { source: "reboundsPerGame", key: "reb", name: "Rebotes por jogo" },
  { source: "assistsPerGame", key: "ast", name: "Assistências por jogo" },
  { source: "stealsPerGame", key: "stl", name: "Roubos de bola por jogo" },
  { source: "blocksPerGame", key: "blk", name: "Tocos por jogo" },
  { source: "3PointsMadePerGame", key: "3pm", name: "Cestas de 3 por jogo" },
];

function leaderAthlete(raw: unknown): AthleteBrief | null {
  const athlete = obj(raw);
  const id = str(athlete.id);
  const name = str(athlete.displayName) ?? str(athlete.fullName);
  if (!id || !/^\d+$/.test(id) || !name) return null;
  const position = str(at(athlete, "position", "abbreviation"));
  return { id, name, headshot: httpUrl(at(athlete, "headshot", "href")), position: position ? position.toUpperCase() : null };
}

/** Líderes estatísticos da temporada (`site/v3/.../leaders`), que já trazem atleta e time resolvidos. */
export function normalizeLeaders(raw: unknown): SeasonLeaders | null {
  const root = obj(raw);
  const categoriesRaw = at(root, "leaders", "categories");
  const year = num(at(root, "requestedSeason", "year"));
  if (!Array.isArray(categoriesRaw) || year === null) return null;
  const byName = new Map(categoriesRaw.map(obj).map((category) => [str(category.name) ?? "", category] as const));
  const categories = LEADER_CATEGORIES.map((def): LeaderCategory | null => {
    const category = byName.get(def.source);
    if (!category) return null;
    const leaders = arr(category.leaders)
      .map(obj)
      .map((leader) => {
        const athlete = leaderAthlete(leader.athlete);
        if (!athlete) return null;
        const team = normalizeTeamRef(leader.team);
        return { athlete, team: team.tbd ? null : team, value: num(leader.value) };
      })
      .filter((leader) => leader !== null)
      .slice(0, 3);
    return leaders.length ? { key: def.key, name: def.name, leaders } : null;
  }).filter((category): category is LeaderCategory => category !== null);
  return {
    year,
    label: str(at(root, "requestedSeason", "displayName")) ?? `${year - 1}-${String(year).slice(2)}`,
    categories,
  };
}
