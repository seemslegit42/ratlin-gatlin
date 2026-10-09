# Dependency Criticality (The Trinity)

The following three services are **non-negotiable** for the system's operational integrity. Failure of any one will trigger cascading service degradation.

## 1. Ollama (The Cognitive Root)
*   **Role:** Local GGUF execution engine.
*   **Criticality:** Primary execution target for low-latency, private AI inference (Granite/Gemma).
*   **Status Monitoring:** Health checked every 15s (`/docker-compose.yml`).
*   **Usage:** Orchestrated by `services/ollamaService.ts`.

## 2. LiteLLM (The Abstract Gateway)
*   **Role:** Enterprise-grade LLM proxy.
*   **Criticality:** Handles model fallbacks, key management, and API abstraction. It bridges the gap between local Ollama inference and external OpenRouter API calls.
*   **Status Monitoring:** Liveliness checked every 15s via `/health/liveliness`.
*   **Usage:** Orchestrated by `services/litellmClient.ts`.

## 3. Postman MCP (The Interaction Bridge)
*   **Role:** Model Context Protocol (MCP) server for Postman integration.
*   **Criticality:** Enables the LLM to *act* on real-world APIs and collections defined within Postman, elevating the agents from chat-bots to functional executors.
*   **Status Monitoring:** Health checked every 10s via `/health`.
*   **Usage:** Orchestrated by `services/postmanApiService.ts` and `/backend/postman/`.

---
*Note: Any modifications to these services require immediate updates to their corresponding documentation and dependency validation.*
