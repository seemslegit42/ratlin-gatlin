#!/usr/bin/env bash
# Deploy Appwrite functions via CLI push (replaces deprecated `appwrite deploy function`).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -z "${APPWRITE_ENDPOINT:-}" || -z "${APPWRITE_PROJECT_ID:-}" || -z "${APPWRITE_API_KEY:-}" ]]; then
  echo "Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY" >&2
  exit 1
fi

if ! command -v appwrite >/dev/null 2>&1; then
  bun install --global appwrite
fi

appwrite client \
  --endpoint "$APPWRITE_ENDPOINT" \
  --project-id "$APPWRITE_PROJECT_ID" \
  --key "$APPWRITE_API_KEY"

appwrite push functions --force
echo "Functions pushed."
