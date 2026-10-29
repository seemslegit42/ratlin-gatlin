#!/usr/bin/env bash
cd "$(dirname "$0")"
export BEEP_OPERATOR=1
export BEEP_ROOT="$PWD"
export PATH="$HOME/.bun/bin:$PATH"
mkdir -p .local
if [[ -x ./dist/beep-app ]]; then
  exec ./dist/beep-app start >> .local/operator.log 2>&1
fi
if ! command -v bun >/dev/null 2>&1; then
  exec ./install-app.sh
fi
exec bun run scripts/run-appliance.ts start >> .local/operator.log 2>&1
