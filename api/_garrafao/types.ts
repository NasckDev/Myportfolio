/**
 * Tipos de domínio do Garrafão. O proxy devolve só estes formatos: o cliente nunca vê o JSON cru da ESPN.
 * Todo campo que a fonte pode omitir é `null`, nunca um valor inventado.
 */

export interface TeamRef {
  id: string;
  /** Sigla como a ESPN publica (ex.: GS, NY, SA). */
  abbr: string;
  name: string;
  shortName: string;
  logo: string | null;
  /** Cores em hex sem `#`, quando a fonte informa. */
  color: string | null;
  altColor: string | null;
  /** Vaga ainda sem time definido (ex.: mata-mata da NBA Cup). */
  tbd: boolean;
}

export type GameState = "pre" | "in" | "post";
export type GameStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "end-period"
  | "final"
  | "postponed"
  | "canceled"
  | "delayed"
  | "unknown";
export type GameKind = "regular" | "cup" | "allstar" | "preseason" | "playin" | "playoffs";

export interface GameCompetitor {
  team: TeamRef;
  homeAway: "home" | "away";
  score: number | null;
  /** Pontos por período (quartos e prorrogações), na ordem. */
  linescores: number[];
  winner: boolean;
  record: string | null;
}

export interface Game {
  id: string;
  /** ISO 8601 em UTC, como a fonte publica. */
  date: string;
  /** Falso quando a fonte ainda não definiu o horário (só a data vale). */
  timeValid: boolean;
  state: GameState;
  status: GameStatus;
  period: number;
  clock: string | null;
  /** Texto curto original da fonte, usado só como último recurso. */
  detail: string;
  kind: GameKind;
  /** Nota oficial do jogo (ex.: "NBA Cup - Group Play"). */
  note: string | null;
  venue: string | null;
  home: GameCompetitor;
  away: GameCompetitor;
}

export interface Scoreboard {
  /** Dia da rodada no formato YYYYMMDD (dia da liga, horário de Nova York). */
  date: string;
  games: Game[];
  hasLive: boolean;
}

export interface GameLeader {
  category: string;
  value: string;
  athleteId: string | null;
  name: string;
  shortName: string;
  headshot: string | null;
}

export interface TeamLeaders {
  teamId: string;
  teamAbbr: string;
  leaders: GameLeader[];
}

export interface GameDetail {
  game: Game;
  leaders: TeamLeaders[];
  attendance: number | null;
}

export interface TeamStanding {
  team: TeamRef;
  seed: number | null;
  wins: number;
  losses: number;
  /** Aproveitamento de 0 a 1. */
  pct: number | null;
  /** 0 para o líder da conferência. */
  gamesBehind: number | null;
  streak: string | null;
  lastTen: string | null;
  home: string | null;
  road: string | null;
  pointDiff: number | null;
}

export interface ConferenceStandings {
  id: "east" | "west";
  name: string;
  teams: TeamStanding[];
}

export interface Standings {
  season: string | null;
  conferences: ConferenceStandings[];
}

export interface NewsItem {
  id: string;
  headline: string;
  description: string | null;
  published: string | null;
  url: string;
  image: { url: string; alt: string } | null;
  byline: string | null;
}

export interface StatLine {
  gp: number | null;
  min: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  fg: number | null;
  tp: number | null;
  ft: number | null;
  tov: number | null;
}

export interface Athlete {
  id: string;
  name: string;
  first: string | null;
  last: string | null;
  jersey: string | null;
  position: { abbr: string; name: string } | null;
  team: TeamRef | null;
  headshot: string | null;
  heightIn: number | null;
  weightLb: number | null;
  age: number | null;
  birthPlace: string | null;
  college: string | null;
  draft: { year: number; round: number; pick: number } | null;
  experience: string | null;
  active: boolean;
  /** Resumo da temporada publicado junto ao perfil (rótulo original + médias principais). */
  summary: { label: string | null; pts: number | null; reb: number | null; ast: number | null; fg: number | null } | null;
}

export interface AthleteStats {
  /** Médias da temporada regular corrente. */
  season: StatLine | null;
  career: StatLine | null;
}

export interface PlayerProfile {
  athlete: Athlete;
  stats: AthleteStats | null;
}

export interface SearchHit {
  id: string;
  name: string;
  teamAbbr: string | null;
  position: string | null;
  headshot: string | null;
}

export interface RosterPlayer {
  id: string;
  name: string;
  jersey: string | null;
  position: string | null;
  headshot: string | null;
}

export interface Roster {
  team: TeamRef;
  players: RosterPlayer[];
}

export interface SeasonPhase {
  id: string;
  slug: "preseason" | "regular" | "playin" | "playoffs" | "offseason" | "other";
  name: string;
  start: string | null;
  end: string | null;
}

export interface SeasonInfo {
  year: number;
  label: string;
  start: string | null;
  end: string | null;
  phases: SeasonPhase[];
}

export interface DraftPick {
  overall: number;
  round: number;
  pick: number;
  team: TeamRef | null;
  athlete: { name: string; position: string | null; from: string | null; headshot: string | null } | null;
  traded: boolean;
  tradeNote: string | null;
}

export interface DraftInfo {
  year: number;
  name: string;
  start: string | null;
  end: string | null;
  rounds: number | null;
  state: GameState | null;
  statusText: string | null;
  picks: DraftPick[];
}

export type SeasonEventStage = "group" | "quarterfinal" | "semifinal" | "final" | "allstar";

export interface SeasonEvent {
  stage: SeasonEventStage;
  /** Nota original da fonte, que identificou o jogo como parte do evento. */
  label: string;
  game: Game;
}

export interface SeasonEvents {
  season: SeasonInfo;
  cup: {
    name: string | null;
    rounds: number | null;
    group: { count: number; first: string; last: string } | null;
    knockout: SeasonEvent[];
  };
  allStar: SeasonEvent[];
  /** Meses do calendário lidos (YYYYMM) e os que falharam: falha parcial vira aviso, não erro. */
  months: { scanned: string[]; failed: string[] };
}

export interface ApiError {
  error: string;
}
