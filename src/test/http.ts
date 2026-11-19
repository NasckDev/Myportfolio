/** Resposta mínima lida por callApi (useCounters): content-type JSON e corpo serializado. */
export function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
}
