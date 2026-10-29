#!/usr/bin/env bash
# Generate self-hosted Appwrite Compose under ./appwrite via official installer (2.6.2).
# Interactive: opens setup wizard on http://localhost:20080
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPWRITE_DIR="$ROOT_DIR/appwrite"
APPWRITE_IMAGE="${APPWRITE_INSTALL_IMAGE:-appwrite/appwrite:2.6.2}"
WIZARD_PORT="${APPWRITE_WIZARD_PORT:-20080}"

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required. Install Docker Engine + Compose v2." >&2
  exit 1
}

mkdir -p "$APPWRITE_DIR"

if [[ -f "$APPWRITE_DIR/docker-compose.yml" ]]; then
  echo "Found existing $APPWRITE_DIR/docker-compose.yml"
  echo "Re-run only if you intend to re-install (backup data first)."
  read -r -p "Continue installer anyway? [y/N] " ans
  [[ "${ans:-}" =~ ^[Yy]$ ]] || exit 0
fi

echo "Starting Appwrite installer ($APPWRITE_IMAGE)..."
echo "Wizard URL: http://localhost:${WIZARD_PORT}"
echo "Generated files will be written to: $APPWRITE_DIR"
echo ""
echo "Edge note (Jetson Nano 4 GB): Appwrite minimum is 4 GB RAM + 2 GB swap — plan capacity before adding inference."
echo ""

docker run -it --rm \
  --publish "${WIZARD_PORT}:20080" \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume "$APPWRITE_DIR:/usr/src/code/appwrite:rw" \
  --entrypoint="install" \
  "$APPWRITE_IMAGE"

echo ""
echo "After the wizard finishes, point BEEP at your instance:"
echo "  APPWRITE_ENDPOINT / VITE_APPWRITE_ENDPOINT → https://<your-hostname>/v1 (or http for local)"
echo "Then: docker compose -f docker-compose.sovereign.yml up -d"
