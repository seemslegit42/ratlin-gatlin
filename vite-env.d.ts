/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When `'true'`, dev BEEP skips Vite `/ollama` proxy and uses `OLLAMA_BASE_URL` (requires Ollama CORS). */
  readonly VITE_OLLAMA_DIRECT?: string;
}
