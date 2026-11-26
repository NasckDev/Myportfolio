import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildMedia, parseMeta, type ProjectMedia } from "../src/lib/media.ts";

/** Lê public/assets/projetos/<id>/ de todos os projetos e aplica a convenção de mídia. */
export function readProjectMedia(publicDir: string): Record<string, ProjectMedia> {
  const root = join(publicDir, "assets", "projetos");
  if (!existsSync(root)) return {};
  const out: Record<string, ProjectMedia> = {};
  for (const id of readdirSync(root)) {
    const dir = join(root, id);
    if (!statSync(dir).isDirectory()) continue;
    const metaPath = join(dir, "meta.json");
    let meta = null;
    if (existsSync(metaPath)) {
      try {
        meta = parseMeta(JSON.parse(readFileSync(metaPath, "utf8")));
      } catch {
        meta = null;
      }
      if (!meta) console.warn(`[mídia] ${id}/meta.json fora da convenção; usando só os arquivos encontrados`);
    }
    out[id] = buildMedia(id, meta, (file) => existsSync(join(dir, file)));
  }
  return out;
}

/** Arquivos meta.json existentes (para o servidor de desenvolvimento recarregar ao mudar). */
export function mediaMetaFiles(publicDir: string): string[] {
  const root = join(publicDir, "assets", "projetos");
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .map((id) => join(root, id, "meta.json"))
    .filter((f) => existsSync(f));
}
