import { handleNba, type NbaRequest, type NbaResponse } from "./_garrafao/handler.js";

/**
 * Proxy de dados públicos da NBA (ESPN) do projeto Garrafão.
 * O código mora no repositório do app (server/) e é copiado para api/_garrafao pelo `npm run publish:portfolio`.
 * GET /api/nba?op=<operação>&... (lista fechada de operações, sem URL vinda do cliente).
 */
export default async function handler(request: NbaRequest, response: NbaResponse) {
  return handleNba(request, response);
}
