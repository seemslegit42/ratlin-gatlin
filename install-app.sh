#!/usr/bin/env bash
cd "$(dirname "$0")"
export BEEP_OPERATOR=1
export BEEP_ROOT="$PWD"
export PATH="$HOME/.bun/bin:$PATH"
mkdir -p .local
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi
exec bun run scripts/install-app.ts >> .local/operator.log 2>&1
