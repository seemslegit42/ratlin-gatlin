@echo off
cd /d "%~dp0"
set BEEP_OPERATOR=1
set BEEP_ROOT=%CD%
set PATH=%USERPROFILE%\.bun\bin;%PATH%
if not exist .local mkdir .local
if exist dist\beep-app.exe (
  start /b dist\beep-app.exe start >> .local\operator.log 2>&1
  exit /b 0
)
if exist dist\beep-app (
  start /b dist\beep-app start >> .local\operator.log 2>&1
  exit /b 0
)
bun run scripts/run-appliance.ts start >> .local\operator.log 2>&1
