/**
 * Downloads official Appwrite 2.6.2 compose assets into ./appwrite (no wizard).
 * Used automatically by scripts/run-appliance.ts — not a manual step.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

const ROOT = resolve(import.meta.dir, '..');
const APPWRITE_DIR = join(ROOT, 'appwrite');
const TAG = '2.6.2';
const BASE = `https://raw.githubusercontent.com/appwrite/appwrite/${TAG}/`;

const STACK_FILES = [
  'docker-compose.yml',
  '.env',
  'clickhouse-config.xml',
  'clickhouse-init.sh',
] as const;

function hex(n = 32): string {
  return randomBytes(n).toString('hex');
}

async function downloadText(path: string): Promise<string> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) {
    throw new Error(`Could not download Appwrite file ${path} (${res.status})`);
  }
  return res.text();
}

function patchAppwriteEnv(raw: string): string {
  let env = raw;
  const replacements: Record<string, string> = {
    _APP_OPENSSL_KEY_V1: hex(32),
    _APP_EXECUTOR_SECRET: hex(32),
    _APP_EXECUTOR_HOST: 'http://appwrite/v1',
    _APP_DOMAIN: 'localhost',
    _APP_CONSOLE_DOMAIN: 'localhost',
    _APP_OPTIONS_ABUSE: 'disabled',
    _APP_OPTIONS_FORCE_HTTPS: 'disabled',
    _APP_HTTP_PORT: '80',
    _APP_HTTPS_PORT: '443',
  };

  for (const [key, value] of Object.entries(replacements)) {
    const lineRe = new RegExp(`^${key}=.*$`, 'm');
    if (lineRe.test(env)) {
      env = env.replace(lineRe, `${key}=${value}`);
    } else {
      env += `\n${key}=${value}`;
    }
  }

  // Replace obvious placeholder secrets in upstream template
  env = env.replace(/=your-[^ \n]+/g, () => `=${hex(16)}`);
  return env;
}

export async function ensureAppwriteStackFiles(): Promise<boolean> {
  mkdirSync(APPWRITE_DIR, { recursive: true });
  const composePath = join(APPWRITE_DIR, 'docker-compose.yml');
  const fresh = !existsSync(composePath);

  if (fresh) {
    for (const file of STACK_FILES) {
      const dest = join(APPWRITE_DIR, file);
      let text = await downloadText(file);
      if (file === '.env') {
        text = patchAppwriteEnv(text);
      }
      writeFileSync(dest, text, 'utf-8');
    }
  } else {
    const envPath = join(APPWRITE_DIR, '.env');
    if (existsSync(envPath)) {
      const patched = patchAppwriteEnv(readFileSync(envPath, 'utf-8'));
      writeFileSync(envPath, patched, 'utf-8');
    }
  }

  return fresh;
}

export function appwriteComposeReady(): boolean {
  return existsSync(join(APPWRITE_DIR, 'docker-compose.yml')) && existsSync(join(APPWRITE_DIR, '.env'));
}
