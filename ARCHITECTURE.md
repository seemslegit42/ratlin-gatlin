
# System Architecture: ΛΞVON OS (B.E.E.P)

## 1. Directory Structure
Modularity is maintained through domain-isolated folders. Atoms (Icons) are separated from Molecules (Widgets) and Organisms (Views).

## 2. State Management
*   **Multi-Tenancy**: All state is isolated by `syndicateId`.
*   **Persistence**: Real-time sync via Appwrite.
*   **Logical History**: Stack-based Undo/Redo at the hook level.

## 3. The Tri-Agentic Mind (AI Core)
The system rejects concurrent parallel processing in favor of a **Serialized Request Chain** for stability.

### AI Stability Protocol
*   **Serialized Chain**: A singleton `requestChain` pointer ensures only one API transaction occurs at a time, protecting the "Sovereign Link" from 429 Rate Limit errors.
*   **Model Tiering**:
    *   *Tier 1 (Pro)*: Complex graph synthesis (Architect).
    *   *Tier 2 (Flash)*: Execution, Transformation, HUD Chat.
    *   *Tier 3 (Lite/Legacy)*: Ambient gossip, simple logs.

## 4. Execution Engine
1.  **Topological Analysis**: Identifies dependency order.
2.  **Input Hydration**: Injects upstream JSON into downstream `{{prompts}}`.
3.  **Aegis Verification**: Intercepts intents for security compliance before execution.

## 5. Visual Layer (Verdigris)
*   **Diegetic Overlay**: Fixed scanlines and vignettes.
*   **Glassmorphism**: Layered CSS blurs and smoky translucency.
*   **3D Neural Lattice**: Three.js particle field responding to global swarm state.
