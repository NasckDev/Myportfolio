/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_PROD_ANALYTICS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:project-media" {
  import type { ProjectMedia } from "@/lib/media";
  const media: Record<string, ProjectMedia>;
  export default media;
}
