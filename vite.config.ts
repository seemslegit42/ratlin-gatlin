import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const ollamaBaseUrl = env.OLLAMA_BASE_URL;
    const ollamaModel = env.OLLAMA_MODEL;
    const ollamaChatPath = env.OLLAMA_CHAT_PATH;
    const llmBackend = env.LLM_BACKEND || 'litellm';
    const litellmProxyTarget = env.LITELLM_PROXY_TARGET || 'http://127.0.0.1:4000';
    const litellmApiKey = env.LITELLM_API_KEY || env.LITELLM_MASTER_KEY || 'sk-beep-local';
    const beepModelGranite = env.BEEP_MODEL_GRANITE?.trim() || 'beep-granite';
    const beepModelGemma = env.BEEP_MODEL_GEMMA?.trim() || 'beep-gemma';
    const architectLlmModel = env.ARCHITECT_LLM_MODEL?.trim() || beepModelGemma;
    const mediapiModelPath = env.MEDIAPIPE_MODEL_PATH || '/assets/gemma-3n-E4B-it-int4-Web.litertlm';
    const mediapipeWasmPath = env.MEDIAPIPE_WASM_PATH || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm';
    const defaultLlmModel =
      env.DEFAULT_LLM_MODEL?.trim() ||
      beepModelGranite ||
      (ollamaModel || '').trim() ||
      'beep-granite';
    const ollamaModelInject =
      typeof ollamaModel === 'string' && ollamaModel.trim().length > 0
        ? ollamaModel.trim()
        : defaultLlmModel;
    const ollamaProxyTarget = env.OLLAMA_PROXY_TARGET || 'http://127.0.0.1:11434';
    const ollamaModelFallback = env.OLLAMA_MODEL_FALLBACK?.trim() ?? '';
    const mcpServerTarget = env.MCP_SERVER_PROXY_TARGET || 'http://127.0.0.1:3100';
    const viteOllamaUrl = env.VITE_OLLAMA_URL?.trim() ?? '';
    const viteMcpUrl = env.VITE_MCP_URL?.trim() ?? '';
    const openrouterSiteUrl = env.OPENROUTER_SITE_URL?.trim() || 'http://localhost:3000';
    const openrouterAppName = env.OPENROUTER_APP_NAME?.trim() || 'BEEP Command — ΛΞV & Co.';
    const llmCloudFallback = env.LLM_CLOUD_FALLBACK?.trim() ?? '1';
    const openrouterRegion = env.OPENROUTER_REGION?.trim().toLowerCase() || 'global';
    const openrouterProxyTarget =
      openrouterRegion === 'eu' ? 'https://eu.openrouter.ai' : 'https://openrouter.ai';

    const appwriteEndpoint =
      env.VITE_APPWRITE_ENDPOINT?.trim() && !env.VITE_APPWRITE_ENDPOINT.includes('//cloud.appwrite.io')
        ? env.VITE_APPWRITE_ENDPOINT.trim()
        : env.APPWRITE_ENDPOINT?.trim() || 'https://tor.cloud.appwrite.io/v1';

    const appwriteProjectId =
      env.VITE_APPWRITE_PROJECT_ID?.trim() && env.VITE_APPWRITE_PROJECT_ID !== 'your-project-id-here' && env.VITE_APPWRITE_PROJECT_ID !== '$APPWRITE_PROJECT_ID'
        ? env.VITE_APPWRITE_PROJECT_ID.trim()
        : env.APPWRITE_PROJECT_ID?.trim() && env.APPWRITE_PROJECT_ID !== 'your_project_id_here' && env.APPWRITE_PROJECT_ID !== '$APPWRITE_PROJECT_ID'
        ? env.APPWRITE_PROJECT_ID.trim()
        : '6990e2830030cacccd98';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: true,
        allowedHosts: true,
        proxy: {
          '/ollama': {
            target: ollamaProxyTarget,
            changeOrigin: true,
            rewrite: (p: string) => p.replace(/^\/ollama/, '') || '/',
            configure: (proxy) => {
              proxy.on('error', (err, _req, res: any) => {
                if (res && !res.headersSent && typeof res.writeHead === 'function') {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Ollama service offline', detail: err.message }));
                }
              });
            },
          },
          '/api/postman': {
            target: mcpServerTarget,
            changeOrigin: true,
            configure: (proxy) => {
              proxy.on('error', (err, _req, res: any) => {
                if (res && !res.headersSent && typeof res.writeHead === 'function') {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Postman MCP bridge offline', detail: err.message }));
                }
              });
            },
          },
          '/mcp': {
            target: mcpServerTarget,
            changeOrigin: true,
            configure: (proxy) => {
              proxy.on('error', (err, _req, res: any) => {
                if (res && !res.headersSent && typeof res.writeHead === 'function') {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'MCP bridge offline', detail: err.message }));
                }
              });
            },
          },
          '/llm': {
            target: litellmProxyTarget,
            changeOrigin: true,
            rewrite: (p: string) => p.replace(/^\/llm/, '') || '/',
            configure: (proxy) => {
              proxy.on('error', (err, _req, res: any) => {
                if (res && !res.headersSent && typeof res.writeHead === 'function') {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'LiteLLM service offline on port 4000', detail: err.message }));
                }
              });
            },
          },
          '/openrouter': {
            target: openrouterProxyTarget,
            changeOrigin: true,
            rewrite: (p: string) => p.replace(/^\/openrouter/, '') || '/',
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq) => {
                const apiKey = env.OPENROUTER_API_KEY?.trim();
                if (apiKey) {
                  proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                }
                if (openrouterSiteUrl) {
                  proxyReq.setHeader('HTTP-Referer', openrouterSiteUrl);
                }
                if (openrouterAppName) {
                  proxyReq.setHeader('X-OpenRouter-Title', openrouterAppName);
                }
              });
            },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.OLLAMA_BASE_URL': JSON.stringify(ollamaBaseUrl),
        'process.env.OLLAMA_MODEL': JSON.stringify(ollamaModelInject),
        'process.env.OLLAMA_CHAT_PATH': JSON.stringify(ollamaChatPath),
        'process.env.LLM_BACKEND': JSON.stringify(llmBackend),
        'process.env.MEDIAPIPE_MODEL_PATH': JSON.stringify(mediapiModelPath),
        'process.env.MEDIAPIPE_WASM_PATH': JSON.stringify(mediapipeWasmPath),
        'process.env.DEFAULT_LLM_MODEL': JSON.stringify(defaultLlmModel),
        'process.env.OLLAMA_MODEL_FALLBACK': JSON.stringify(ollamaModelFallback),
        'process.env.VITE_OLLAMA_URL': JSON.stringify(viteOllamaUrl),
        'process.env.VITE_MCP_URL': JSON.stringify(viteMcpUrl),
        'process.env.LITELLM_BASE_URL': JSON.stringify(env.LITELLM_BASE_URL?.trim() ?? ''),
        'process.env.LITELLM_API_KEY': JSON.stringify(litellmApiKey),
        'process.env.VITE_LITELLM_URL': JSON.stringify(env.VITE_LITELLM_URL?.trim() ?? ''),
        'process.env.BEEP_MODEL_GRANITE': JSON.stringify(beepModelGranite),
        'process.env.BEEP_MODEL_GEMMA': JSON.stringify(beepModelGemma),
        'process.env.ARCHITECT_LLM_MODEL': JSON.stringify(architectLlmModel),
        'process.env.OPENROUTER_SITE_URL': JSON.stringify(openrouterSiteUrl),
        'process.env.OPENROUTER_APP_NAME': JSON.stringify(openrouterAppName),
        'process.env.LLM_CLOUD_FALLBACK': JSON.stringify(llmCloudFallback),
        'process.env.OPENROUTER_REGION': JSON.stringify(openrouterRegion),
        'process.env.OPENROUTER_ZDR': JSON.stringify(env.OPENROUTER_ZDR?.trim() ?? '1'),
        'process.env.OPENROUTER_DENY_DATA_COLLECTION': JSON.stringify(
          env.OPENROUTER_DENY_DATA_COLLECTION?.trim() ?? '1',
        ),
        'process.env.OPENROUTER_NATIVE_TOOLS': JSON.stringify(env.OPENROUTER_NATIVE_TOOLS?.trim() ?? '0'),
        'process.env.OPENROUTER_SUBAGENT': JSON.stringify(env.OPENROUTER_SUBAGENT?.trim() ?? '0'),
        'process.env.OPENROUTER_SUBAGENT_ARCHITECT_ONLY': JSON.stringify(
          env.OPENROUTER_SUBAGENT_ARCHITECT_ONLY?.trim() ?? '1',
        ),
        'process.env.VITE_APPWRITE_ENDPOINT': JSON.stringify(appwriteEndpoint),
        'process.env.VITE_APPWRITE_PROJECT_ID': JSON.stringify(appwriteProjectId),
        'process.env.APPWRITE_ENDPOINT': JSON.stringify(appwriteEndpoint),
        'process.env.APPWRITE_PROJECT_ID': JSON.stringify(appwriteProjectId),
        'import.meta.env.VITE_APPWRITE_ENDPOINT': JSON.stringify(appwriteEndpoint),
        'import.meta.env.VITE_APPWRITE_PROJECT_ID': JSON.stringify(appwriteProjectId),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'appwrite': path.resolve(__dirname, 'services/appwritePresencesShim.ts'),
        }
      }
    };
});
