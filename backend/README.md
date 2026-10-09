# Backend Infrastructure

This directory houses the server-side functions and infrastructure-level logic that support the B.E.E.P frontend and core agentic capabilities.

## Key Components

- **`functions/`**: Independent server-side functions (e.g., Stripe webhooks, CRM processing, workflow trigger logic) executed in response to system events.
- **`llm-server.ts`**: Dedicated server for high-load LLM processing, enabling background agentic tasks outside the main frontend application loop.
- **`postman/`**: Infrastructure for the Postman MCP (Model Context Protocol) server, providing bridge capabilities for API integrations.
- **`beep-core/`**: Core engine components including model loaders and environment-specific runtime configurations.

## Operational Protocol
- Functions in `functions/` are typically triggered by Appwrite events or external webhooks (e.g., Stripe).
- Ensure all backend code adheres to security standards defined in `ARCHITECTURE.md`, particularly input sanitization for external webhooks.
