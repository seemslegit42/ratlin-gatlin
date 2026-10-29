@echo off
cd /d "%~dp0"
set BEEP_OPERATOR=1
set BEEP_ROOT=%CD%
set PATH=%USERPROFILE%\.bun\bin;%PATH%
if not exist .local mkdir .local
where bun >nul 2>nul || powershell -NoProfile -ExecutionPolicy Bypass -c "irm bun.sh/install.ps1|iex"
bun run scripts/install-app.ts >> .local\operator.log 2>&1
