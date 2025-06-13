/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YAHOO_FINANCE_API_KEY: string;
  readonly VITE_POLYGON_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
