#!/bin/sh
# BEEP Dominion — Ollama bootstrap (Granite + Gemma GGUF register + serve)
set -eu

GRANITE_MODEL="${BEEP_GRANITE_MODEL:-beep-granite-4.1-3b}"
GEMMA_MODEL="${BEEP_GEMMA_MODEL:-beep-gemma-4-12b}"
LEGACY_MODEL="${OLLAMA_MODEL_NAME:-beep-qwen3p5-0.8b-iq2-xxs}"

GRANITE_GGUF="/gguf/granite-4.1-3b-UD-Q8_K_XL.gguf"
GEMMA_GGUF="/gguf/Gemma-4-12B-OBLITERATED.i1-Q5_K_M.gguf"
GRANITE_MOD="/modelfiles/granite-4.1-3b.Modelfile"
GEMMA_MOD="/modelfiles/gemma-4-12b.Modelfile"
QWEN_MOD="/modelfiles/qwen3p5-0.8b-iq2-xxs.Modelfile"
QWEN_GGUF="/assets/Qwen3.5-0.8B-UD-IQ2_XXS.gguf"

log() {
  printf '[beep-ollama] %s\n' "$1"
}

wait_for_api() {
  attempts=0
  max=120
  while [ "$attempts" -lt "$max" ]; do
    if wget -qO- "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 2
  done
  return 1
}

register_if_needed() {
  name="$1"
  modfile="$2"
  gguf="$3"

  if ollama list 2>/dev/null | grep -Fq "$name"; then
    log "Model already registered: $name"
    return 0
  fi
  if [ ! -f "$modfile" ]; then
    log "Modelfile missing: $modfile — skip $name"
    return 0
  fi
  if [ ! -f "$gguf" ]; then
    log "GGUF missing: $gguf — skip $name"
    return 0
  fi
  log "Registering $name ..."
  moddir=$(dirname "$modfile")
  modbase=$(basename "$modfile")
  (cd "$moddir" && ollama create "$name" -f "$modbase") || {
    log "WARN: registration failed for $name"
  }
}

log "Starting ollama serve..."
ollama serve &
SERVE_PID=$!

trap 'log "Shutting down..."; kill "$SERVE_PID" 2>/dev/null || true; wait "$SERVE_PID" 2>/dev/null || true' INT TERM

if ! wait_for_api; then
  log "ERROR: Ollama API did not become ready in time"
  kill "$SERVE_PID" 2>/dev/null || true
  exit 1
fi

register_if_needed "$GRANITE_MODEL" "$GRANITE_MOD" "$GRANITE_GGUF"
register_if_needed "$GEMMA_MODEL" "$GEMMA_MOD" "$GEMMA_GGUF"
register_if_needed "$LEGACY_MODEL" "$QWEN_MOD" "$QWEN_GGUF"

log "Ollama ready — models: $GRANITE_MODEL (fast), $GEMMA_MODEL (architect)"

wait "$SERVE_PID"
