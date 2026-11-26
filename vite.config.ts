import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { mediaMetaFiles, readProjectMedia } from "./scripts/projectMedia.ts";

const PUBLIC_DIR = fileURLToPath(new URL("./public", import.meta.url));
const MEDIA_ID = "virtual:project-media";
const RESOLVED_MEDIA_ID = "\0" + MEDIA_ID;

/** Expõe a mídia dos projetos (public/assets/projetos/<id>/) como módulo, lida no build. */
function projectMedia(): Plugin {
  return {
    name: "project-media",
    resolveId: (id) => (id === MEDIA_ID ? RESOLVED_MEDIA_ID : null),
    load(id) {
      if (id !== RESOLVED_MEDIA_ID) return null;
      for (const f of mediaMetaFiles(PUBLIC_DIR)) this.addWatchFile(f);
      return `export default ${JSON.stringify(readProjectMedia(PUBLIC_DIR))};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), projectMedia()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: process.env.VITE_BASE_PATH || "/",
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
});
