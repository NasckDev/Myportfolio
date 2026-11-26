/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_PROD_ANALYTICS?: string;
  /** Chave pública do Web3Forms. Sem ela, o contato só oferece "Abrir no meu e-mail" e "Copiar". */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:project-media" {
  import type { ProjectMedia } from "@/lib/media";
  const media: Record<string, ProjectMedia>;
  export default media;
}
