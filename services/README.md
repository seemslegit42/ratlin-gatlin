# Services Layer

This directory contains the core business logic, API clients, and service abstractions for the B.E.E.P platform.

## Key Service Clusters

- **Appwrite Integration (`services/appwrite*`)**: Core SDK wrappers, client initialization, and type definitions for real-time Appwrite interactions.
- **LLM/AI Orchestration (`services/ollamaService.ts`, `services/openrouter*`, `services/litellmClient.ts`)**: Abstractions for interacting with local Ollama instances, OpenRouter agents, and LiteLLM middleware.
- **Workflow & Agentic Core (`services/weaverService.ts`, `services/workflowService.ts`, `services/agentFactory.ts`)**: Logic for constructing, executing, and monitoring agent-driven workflows.
- **Business Operations (`services/crmService.ts`, `services/xiEconomyService.ts`, `services/stripeService.ts`)**: Domain-specific logic for CRM management, internal tokenized economy, and payment processing.
- **Utility & Infrastructure (`services/aegisService.ts`, `services/telemetryService.ts`, `services/authService.ts`)**: Cross-cutting concerns including security verification, observability, and authentication management.

## Guidelines
- All new services must implement robust error handling (use `authErrors.ts` for standardized error classification).
- Prefer dependency injection for testability (e.g., passing clients to service constructors).
- Use `appwriteClient.ts` for database operations to ensure regional normalization and payload sanitization.
