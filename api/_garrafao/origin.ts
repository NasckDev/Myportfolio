/**
 * Endereços de origem. Cada URL é montada aqui a partir de parâmetros já validados:
 * o cliente nunca envia uma URL, só escolhe uma operação da lista fechada (sem SSRF).
 */

const SITE = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba";
const STANDINGS = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";
const COMMON = "https://site.web.api.espn.com/apis/common/v3";
const CORE = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba";

export const ORIGIN_HOSTS: ReadonlySet<string> = new Set([
  "site.api.espn.com",
  "site.web.api.espn.com",
  "sports.core.api.espn.com",
]);

/** Id do torneio NBA Cup na API core (`/tournaments`, verificado em 25/11/2026). */
const NBA_CUP_TOURNAMENT_ID = "1";
/** O placar por mês devolve até `limit` jogos; um mês de NBA tem por volta de 230 no máximo. */
const MONTH_LIMIT = 400;
const NEWS_LIMIT = 20;
const SEARCH_LIMIT = 10;

export const originUrl = {
  scoreboardDay: (date: string) => `${SITE}/scoreboard?dates=${date}`,
  scoreboardMonth: (month: string) => `${SITE}/scoreboard?dates=${month}&limit=${MONTH_LIMIT}`,
  summary: (eventId: string) => `${SITE}/summary?event=${eventId}`,
  standings: () => STANDINGS,
  news: () => `${SITE}/news?limit=${NEWS_LIMIT}`,
  teams: () => `${SITE}/teams`,
  roster: (teamId: string) => `${SITE}/teams/${teamId}/roster`,
  athlete: (id: string) => `${COMMON}/sports/basketball/nba/athletes/${id}`,
  overview: (id: string) => `${COMMON}/sports/basketball/nba/athletes/${id}/overview`,
  search: (query: string) =>
    `${COMMON}/search?query=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}&type=player&sport=basketball&league=nba`,
  season: (year: number) => `${CORE}/seasons/${year}`,
  draftCore: (year: number) => `${CORE}/seasons/${year}/draft`,
  draftSite: (year: number) => `${SITE}/draft?season=${year}`,
  cupTournament: () => `${CORE}/tournaments/${NBA_CUP_TOURNAMENT_ID}`,
  cupSeason: (year: number) => `${CORE}/tournaments/${NBA_CUP_TOURNAMENT_ID}/seasons/${year}`,
};
