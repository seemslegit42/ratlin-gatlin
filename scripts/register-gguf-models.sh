#!/usr/bin/env bash
# Register Granite 4.1 3B + Gemma 4 12B GGUF models in local Ollama.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GGUF_DIR="${GGUF_HOST_PATH:-$ROOT_DIR/../gguf}"
GRANITE_MODEL="${BEEP_GRANITE_MODEL:-beep-granite-4.1-3b}"
GEMMA_MODEL="${BEEP_GEMMA_MODEL:-beep-gemma-4-12b}"

command -v ollama >/dev/null 2>&1 || { echo "Install Ollama: https://ollama.ai" >&2; exit 1; }

GRANITE_GGUF="$GGUF_DIR/granite-4.1-3b-UD-Q8_K_XL.gguf"
GEMMA_GGUF="$GGUF_DIR/Gemma-4-12B-OBLITERATED.i1-Q5_K_M.gguf"

for f in "$GRANITE_GGUF" "$GEMMA_GGUF"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing GGUF: $f" >&2
    exit 1
  fi
done

register() {
  local name="$1"
  local modfile="$2"
  if ollama list 2>/dev/null | grep -Fq "$name"; then
    echo "Already registered: $name"
    return 0
  fi
  echo "Creating $name ..."
  (cd "$ROOT_DIR/assets/modelfiles" && ollama create "$name" -f "$(basename "$modfile")")
}

# Modelfiles use /gguf paths — symlink for local ollama create
mkdir -p "$ROOT_DIR/assets/gguf-mount"
ln -sfn "$GGUF_DIR/granite-4.1-3b-UD-Q8_K_XL.gguf" "$ROOT_DIR/assets/gguf-mount/granite-4.1-3b-UD-Q8_K_XL.gguf"
ln -sfn "$GEMMA_GGUF" "$ROOT_DIR/assets/gguf-mount/Gemma-4-12B-OBLITERATED.i1-Q5_K_M.gguf"

# Local modelfiles with relative paths for host registration
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/granite.Modelfile" <<EOF
FROM $GRANITE_GGUF
PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
EOF

cat > "$TMP/gemma.Modelfile" <<EOF
FROM $GEMMA_GGUF
PARAMETER temperature 0.35
PARAMETER top_p 0.92
PARAMETER num_ctx 8192
EOF

ollama create "$GRANITE_MODEL" -f "$TMP/granite.Modelfile"
ollama create "$GEMMA_MODEL" -f "$TMP/gemma.Modelfile"

echo ""
echo "Registered:"
echo "  $GRANITE_MODEL  (fast / mainframe)"
echo "  $GEMMA_MODEL    (architect / Weaver)"
echo ""
echo "Set in .env:"
echo "  LLM_BACKEND=litellm"
echo "  DEFAULT_LLM_MODEL=beep-granite"
echo "  BEEP_MODEL_GEMMA=beep-gemma"
echo "  LITELLM_BASE_URL=http://localhost:4000"
echo "  LITELLM_API_KEY=sk-beep-local"
