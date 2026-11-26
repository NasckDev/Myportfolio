import allMedia from "virtual:project-media";
import { EMPTY_MEDIA, type ProjectMedia } from "@/lib/media";

/** Mídia de um projeto segundo a convenção de public/assets/projetos/<id>/ (vazia se não houver pasta). */
export function mediaOf(id: string): ProjectMedia {
  return allMedia[id] ?? EMPTY_MEDIA;
}
