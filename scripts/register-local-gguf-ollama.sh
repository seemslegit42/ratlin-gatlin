#!/usr/bin/env bash
# Import the repo-local Qwen GGUF into Ollama (GGUF inference).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL_NAME="${1:-beep-qwen3p5-0.8b-iq2-xxs}"
MODFILE="$ROOT/assets/modelfiles/qwen3p5-0.8b-iq2-xxs.Modelfile"
GGUF="$ROOT/assets/Qwen3.5-0.8B-UD-IQ2_XXS.gguf"

if [[ ! -f "$GGUF" ]]; then
  echo "Missing GGUF: $GGUF" >&2
  exit 1
fi
if [[ ! -f "$MODFILE" ]]; then
  echo "Missing Modelfile: $MODFILE" >&2
  exit 1
fi

command -v ollama >/dev/null 2>&1 || { echo "Install Ollama: https://ollama.ai" >&2; exit 1; }

echo "Creating Ollama model '$MODEL_NAME' from Modelfile..."
ollama create "$MODEL_NAME" -f "$MODFILE"
echo ""
echo "Done. In .env set:"
echo "  LLM_BACKEND=ollama"
echo "  OLLAMA_MODEL=$MODEL_NAME"
echo "  DEFAULT_LLM_MODEL=$MODEL_NAME"
