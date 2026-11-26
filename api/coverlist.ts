import { handleCoverlist, type CoverlistRequest, type CoverlistResponse } from "./_coverlist/handler.js";

/**
 * Proxy de música do Coverlist (/api/coverlist?op=...): lista fechada de operações, validação de
 * parâmetros, timeout, cache na borda e normalização de Deezer, iTunes e Apple RSS.
 * O código e os testes ficam no repositório do Coverlist (server/); este arquivo e a pasta _coverlist
 * são gerados por `npm run publish:portfolio` lá.
 */
export default async function handler(request: CoverlistRequest, response: CoverlistResponse) {
  return handleCoverlist(request, response);
}
