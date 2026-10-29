#!/usr/bin/env bun
/** One-time operator install: Bun, dependencies, standalone launcher, autostart, desktop shortcuts. */
import { mkdirSync, writeFileSync, chmodSync, copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'bun';
import { ensureBunInstalled } from './ensure-bun.js';
import { status, statusAttention } from './operator-status.js';

const ROOT = resolve(import.meta.dir, '..');
process.chdir(ROOT);

async function buildExecutable(bun: string): Promise<string> {
  const distDir = join(ROOT, 'dist');
  mkdirSync(distDir, { recursive: true });
  const outFile = join(distDir, 'beep-app');
  const compile = spawnSync([
    bun,
    'build',
    '--compile',
    join(ROOT, 'scripts/run-appliance.ts'),
    '--outfile',
    outFile,
  ]);
  if (compile.exitCode !== 0 || !existsSync(outFile)) statusAttention();
  chmodSync(outFile, 0o755);
  return outFile;
}

function writeLinuxAutostart(launcher: string): void {
  const dir = join(homedir(), '.config', 'autostart');
  mkdirSync(dir, { recursive: true });
  const desktop = `[Desktop Entry]
Type=Application
Name=BEEP
Comment=BEEP Application
Exec=${launcher} start
Terminal=false
X-GNOME-Autostart-enabled=true
`;
  writeFileSync(join(dir, 'beep-app-autostart.desktop'), desktop, 'utf-8');
}

function writeMacAutostart(launcher: string): void {
  const dir = join(homedir(), 'Library', 'LaunchAgents');
  mkdirSync(dir, { recursive: true });
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.beep.app</string>
  <key>ProgramArguments</key>
  <array><string>${launcher}</string><string>start</string></array>
  <key>RunAtLoad</key><true/>
</dict>
</plist>`;
  writeFileSync(join(dir, 'com.beep.app.plist'), plist, 'utf-8');
}

function writeWindowsAutostart(launcher: string): void {
  const startup = join(
    homedir(),
    'AppData',
    'Roaming',
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
    'Startup',
    'beep-app.bat',
  );
  mkdirSync(join(startup, '..'), { recursive: true });
  writeFileSync(startup, `@echo off\r\n"${launcher}" start\r\n`, 'utf-8');
}

function installAutostart(launcher: string): void {
  if (process.platform === 'darwin') writeMacAutostart(launcher);
  else if (process.platform === 'win32') writeWindowsAutostart(launcher);
  else writeLinuxAutostart(launcher);
}

async function main(): Promise<void> {
  status('working');
  const bun = await ensureBunInstalled();

  if (spawnSync([bun, 'install'], { cwd: ROOT, stdout: 'pipe', stderr: 'pipe' }).exitCode !== 0) {
    statusAttention();
  }

  const launcher = await buildExecutable(bun);
  installAutostart(launcher);

  const desktopSrc = join(ROOT, 'start-app.desktop');
  if (existsSync(desktopSrc)) {
    const desktopDir = join(homedir(), 'Desktop');
    if (existsSync(desktopDir)) {
      try {
        copyFileSync(desktopSrc, join(desktopDir, 'beep-app.desktop'));
      } catch {
        /* optional */
      }
    }
  }

  status('done');
  spawnSync([launcher, 'start'], { cwd: ROOT, stdout: 'inherit', stderr: 'inherit', env: process.env });
}

main().catch(() => statusAttention());
