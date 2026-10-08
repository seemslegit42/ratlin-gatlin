#!/usr/bin/env bash
# Deploy all Appwrite resources via modern CLI push (Sites, Functions, Tables, Buckets).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required=(APPWRITE_ENDPOINT APPWRITE_PROJECT_ID APPWRITE_API_KEY)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing ${var}" >&2
    exit 1
  fi
done

if ! command -v appwrite >/dev/null 2>&1; then
  echo "Installing Appwrite CLI…" >&2
  bun install --global appwrite
fi

echo "Configuring Appwrite client…"
appwrite client \
  --endpoint "$APPWRITE_ENDPOINT" \
  --project-id "$APPWRITE_PROJECT_ID" \
  --key "$APPWRITE_API_KEY"

echo "Building SPA for Sites…"
bun run build

targets=(tables buckets functions sites)
for target in "${targets[@]}"; do
  echo "Pushing ${target}…"
  appwrite push "$target" --force
done

echo "Appwrite deploy complete."
