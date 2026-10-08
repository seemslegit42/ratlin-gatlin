
# ΛΞVON OS (B.E.E.P) - Function Reference & Documentation

This document outlines the core functions, services, hooks, and architectural components required to operate the ΛΞVON OS application.

## 1. Core Services

### 1.1 Artificial Intelligence (`services/ollamaService.ts`)
The bridge to Ollama (Qwen Coder) over HTTP, managing text generation, tool calling, and stability.

*   **Stability Protocols**:
    *   **Request Queue**: All AI calls are serialized via a Promise chain to prevent concurrent limit collisions.
    *   **Rate Throttling**: A 2-second cooldown is enforced between major requests.
    *   **Exponential Backoff**: Automatic retries for 429 errors with increasing delays (4s, 8s, 16s).
*   **`runMainframeChat`**: Processes Sovereign commands in the C-HUD. Supports navigation and widget spawning.
*   **`runChatAgent`**: High-reasoning architect for workflow construction.
*   **`runCognitiveCore`**: Standard execution unit for canvas agents.
*   **`generateDynamicGossip`**: Lowest-priority background ambient generator.

### 1.2 Persistence Bridge (`services/supabaseClient.ts`)
The immutable connection to the Postgres backend.
*   **Session Healing**: Automatically reconciles auth states with user profiles.
*   **Realtime**: Provides broadcast channels for multiplayer cursors and state sync.

## 2. Global Hooks

### 2.1 `useWorkflowState(syndicateId)`
The primary orchestrator for the Weaver Studio.
*   Manages `agents`, `connections`, and `crews`.
*   Includes **Undo/Redo** history and **Snapshot** functionality.

### 2.2 `useStreamingChat(...)`
The conversational bridge. Handles Markdown rendering, streaming animations, and functional tool execution (like switching views or adding agents via voice).

### 2.3 `useGossip(agents)`
Ambient swarm intelligence tracker. Generates diegetic logs and "current bubbles" for the Simulacrum view. Throttled to 30-60s intervals to preserve API quota.

## 3. UI Metaphors

*   **The Cockpit (MainView)**: Immersive dashboard with pinned holographic widgets.
*   **The Weaver (Architect)**: Infinite canvas for visual programming of agents.
*   **The Glasshouse (Simulacrum)**: Spatial visualization of agent moods and social tethers.

---

## 4. Stability Best Practices
1.  **Queue Everything**: Never call Ollama directly; always use `enqueueRequest` in the service.
2.  **Model Optimization**: Set `OLLAMA_MODEL` for the primary model. Override per-agent only when needed.
3.  **Silence Gossip**: If rate limits are a concern, increase the stochastic interval in `useGossip.ts`.
