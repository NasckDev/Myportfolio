// Cliente mínimo da API pública do iNaturalist (https://api.inaturalist.org/v1/).
// Sem chave. Cache em memória + sessionStorage e fila de 1 requisição por segundo,
// seguindo a orientação de uso da API. Só usa fotos e sons com licença Creative Commons.

const API = "https://api.inaturalist.org/v1";
const TTL_MS = 30 * 60 * 1000;
const GAP_MS = 1000;
const CACHE_KEY = "bluebird-inat-v1:";

export const OPEN_LICENSES = ["cc0", "cc-by", "cc-by-nc", "cc-by-sa", "cc-by-nc-sa", "cc-by-nd", "cc-by-nc-nd"];
const LICENSE_PARAM = OPEN_LICENSES.join(",");
const PLAYABLE = /^audio\/(mpeg|mp3|mp4|x-m4a|aac|ogg)/i;

const memory = new Map();
let queue = Promise.resolve();
let last = 0;

function readStored(url) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY + url);
    if (!raw) return null;
    const hit = JSON.parse(raw);
    return Date.now() - hit.t < TTL_MS ? hit.v : null;
  } catch {
    return null;
  }
}

function store(url, value) {
  try {
    sessionStorage.setItem(CACHE_KEY + url, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    /* cota cheia ou armazenamento bloqueado: segue só com a memória */
  }
}

function throttled(url) {
  const run = queue.then(async () => {
    const wait = Math.max(0, last + GAP_MS - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`iNaturalist respondeu ${res.status}`);
    return res.json();
  });
  queue = run.catch(() => {});
  return run;
}

function get(path, params) {
  const qs = new URLSearchParams({ locale: "en", ...params });
  const url = `${API}${path}?${qs}`;
  if (memory.has(url)) return memory.get(url);
  const stored = readStored(url);
  if (stored) {
    const hit = Promise.resolve(stored);
    memory.set(url, hit);
    return hit;
  }
  const pending = throttled(url).then((json) => {
    store(url, json);
    return json;
  });
  memory.set(url, pending);
  pending.catch(() => memory.delete(url));
  return pending;
}

const sized = (url, size) => (url ? url.replace(/\/(square|small|medium|large|original)\./, `/${size}.`) : "");

function openPhoto(photo) {
  if (!photo || !OPEN_LICENSES.includes(photo.license_code)) return null;
  return {
    square: sized(photo.square_url || photo.url, "square"),
    medium: sized(photo.medium_url || photo.url, "medium"),
    large: sized(photo.large_url || photo.url, "large"),
    attribution: photo.attribution,
    license: photo.license_code,
  };
}

export function licenseUrl(code) {
  if (code === "cc0") return "https://creativecommons.org/publicdomain/zero/1.0/";
  return `https://creativecommons.org/licenses/${String(code).replace(/^cc-/, "")}/4.0/`;
}

export function licenseLabel(code) {
  return code === "cc0" ? "CC0" : String(code).toUpperCase().replace(/^CC-/, "CC ");
}

function plainText(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

function toSpecies(taxon, count) {
  return {
    id: taxon.id,
    name: taxon.preferred_common_name || taxon.name,
    sci: taxon.name,
    group: taxon.iconic_taxon_name,
    photo: openPhoto(taxon.default_photo),
    observations: taxon.observations_count || 0,
    nearbyRecordings: count ?? null,
    summary: "",
    wikipedia: taxon.wikipedia_url || "",
    status: null,
  };
}

/** Espécies com gravações perto de um ponto, das mais observadas para as menos. */
export async function speciesNear({ lat, lng, radius, iconic, perPage = 12 }) {
  const json = await get("/observations/species_counts", {
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    iconic_taxa: iconic,
    sounds: "true",
    quality_grade: "research",
    per_page: String(perPage),
  });
  return { total: json.total_results, species: json.results.map((r) => toSpecies(r.taxon, r.count)) };
}

/**
 * Completa fotos abertas, resumo da Wikipédia e status de conservação (uma chamada para até 30 táxons).
 * `leadIds` entram no início da lista, mesmo que não estejam em `species`.
 */
export async function enrich(species, leadIds = []) {
  const extra = leadIds.filter((id) => !species.some((s) => s.id === id));
  const ids = [...extra, ...species.map((s) => s.id)].slice(0, 30);
  if (!ids.length) return species;
  const json = await get(`/taxa/${ids.join(",")}`, {});
  const byId = new Map(json.results.map((t) => [t.id, t]));
  const lead = leadIds.map((id) => species.find((s) => s.id === id) || (byId.get(id) ? toSpecies(byId.get(id), null) : null)).filter(Boolean);
  const ordered = [...lead, ...species.filter((s) => !leadIds.includes(s.id))];
  return ordered.map((s) => {
    const t = byId.get(s.id);
    if (!t) return s;
    const photos = (t.taxon_photos || []).map((tp) => openPhoto(tp.photo)).filter(Boolean);
    const cs = t.conservation_status;
    return {
      ...s,
      photo: s.photo || photos[0] || null,
      observations: t.observations_count || s.observations,
      summary: plainText(t.wikipedia_summary),
      wikipedia: t.wikipedia_url || s.wikipedia,
      status: cs && cs.status_name ? { name: cs.status_name, authority: cs.authority || "" } : null,
    };
  });
}

/** Uma gravação aberta (mp3/m4a) da espécie, priorizando as mais votadas. */
export async function recording(taxonId) {
  const json = await get("/observations", {
    taxon_id: String(taxonId),
    sounds: "true",
    quality_grade: "research",
    sound_license: LICENSE_PARAM,
    order_by: "votes",
    per_page: "8",
  });
  for (const o of json.results) {
    for (const s of o.sounds || []) {
      if (!OPEN_LICENSES.includes(s.license_code) || !s.file_url || !PLAYABLE.test(s.file_content_type || "")) continue;
      return {
        url: s.file_url,
        attribution: s.attribution,
        license: s.license_code,
        observation: `https://www.inaturalist.org/observations/${o.id}`,
        where: o.place_guess || "",
      };
    }
  }
  return null;
}

/** Observações recentes de aves perto de um ponto (com foto aberta). */
export async function recentNear({ lat, lng, radius, perPage = 8 }) {
  const json = await get("/observations", {
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    iconic_taxa: "Aves",
    quality_grade: "research",
    photos: "true",
    photo_license: LICENSE_PARAM,
    order_by: "observed_on",
    order: "desc",
    per_page: String(perPage),
  });
  return json.results
    .filter((o) => o.taxon)
    .map((o) => ({
      id: o.id,
      url: `https://www.inaturalist.org/observations/${o.id}`,
      name: o.taxon.preferred_common_name || o.taxon.name,
      sci: o.taxon.name,
      taxonId: o.taxon.id,
      when: o.time_observed_at || o.observed_on,
      user: o.user ? o.user.login : "",
      coords: o.geojson && o.geojson.coordinates ? { lng: o.geojson.coordinates[0], lat: o.geojson.coordinates[1] } : null,
      photo: openPhoto((o.photos || [])[0]),
      hasSound: (o.sounds || []).length > 0,
    }));
}
