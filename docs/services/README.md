# Services Layer (The Engine Room)

The `services/` directory is the backbone of the application. It orchestrates LLM interactions, data persistence, and core business workflows.

## Core Services

| Service | Responsibility | Status |
| :--- | :--- | :--- |
| `aegisService.ts` | Security & Access Guarding | [VERIFIED] |
| `appwriteClient.ts` | Appwrite SDK Initialization | [VERIFIED] |
| `beepService.ts` | Beep Core (Ollama/LLM Orchestration) | [VERIFIED] |
| `chaosService.ts` | Chaos Economy & Simulacrum Logic | [VERIFIED] |
| `crmService.ts` | CRM & Lead Flywheel Persistence | [VERIFIED] |
| `weaverService.ts` | Workflow Graph Execution & Node Logic | [VERIFIED] |

## Principles
1.  **Dependency Inversion:** All services interact through interfaces.
2.  **No Direct DOM Access:** Services are pure logic/I/O handlers.
3.  **Error Handling:** Standardized error wrapping via `authErrors.ts`.

## Documentation Integrity
*   Any new service added MUST be documented here.
*   If a service exceeds 500 lines, extract related logic into a sub-module.
