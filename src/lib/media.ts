/**
 * Convenção de mídia dos projetos (fonte única), em public/assets/projetos/<id>/:
 * desktop-1..3.webp, mobile.webp, preview.mp4/.webm, preview-poster.webp, og.jpg e meta.json
 * ({ "shots": [["desktop-1","legenda"],...], "mobile": "legenda", "video": true|false }).
 * Este módulo é puro: quem lê o disco (plugin do Vite e pré-render) passa `has` e o JSON.
 */
export interface MediaShot {
  src: string;
  caption: string;
}

export interface MediaVideo {
  mp4: string;
  webm: string;
  poster: string;
}

export interface ProjectMedia {
  shots: MediaShot[];
  mobile: MediaShot | null;
  video: MediaVideo | null;
  og: string | null;
}

export interface MediaMeta {
  shots: [string, string][];
  mobile: string | null;
  video: boolean;
}

export const MEDIA_ROOT = "/assets/projetos";

const SHOT_NAME = /^[a-z0-9-]+$/;

/** Valida o meta.json; devolve null se o formato não for o da convenção. */
export function parseMeta(raw: unknown): MediaMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.shots)) return null;
  const shots: [string, string][] = [];
  for (const s of r.shots) {
    if (!Array.isArray(s) || typeof s[0] !== "string" || typeof s[1] !== "string" || !SHOT_NAME.test(s[0])) return null;
    shots.push([s[0], s[1]]);
  }
  const mobile = typeof r.mobile === "string" && r.mobile.trim() ? r.mobile : null;
  return { shots, mobile, video: r.video === true };
}

/** Monta a mídia de um projeto só com os arquivos que existem de fato. */
export function buildMedia(id: string, meta: MediaMeta | null, has: (file: string) => boolean): ProjectMedia {
  const base = `${MEDIA_ROOT}/${id}/`;
  const shots = (meta?.shots ?? [])
    .filter(([name]) => has(`${name}.webp`))
    .map(([name, caption]) => ({ src: `${base}${name}.webp`, caption }));
  const mobile = meta?.mobile && has("mobile.webp") ? { src: `${base}mobile.webp`, caption: meta.mobile } : null;
  const firstShot = shots[0]?.src ?? "";
  const video =
    meta?.video && has("preview.mp4") && has("preview.webm")
      ? { mp4: `${base}preview.mp4`, webm: `${base}preview.webm`, poster: has("preview-poster.webp") ? `${base}preview-poster.webp` : firstShot }
      : null;
  return { shots, mobile, video, og: has("og.jpg") ? `${base}og.jpg` : null };
}

export const EMPTY_MEDIA: ProjectMedia = { shots: [], mobile: null, video: null, og: null };
