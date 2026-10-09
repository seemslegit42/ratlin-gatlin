# Hooks Architecture

This directory defines custom React hooks providing the primary interface between the UI components and the underlying application state.

## Core Hook Design Principles

- **Separation of Concerns**: Hooks manage state interaction, not raw business logic. Business logic should reside in the `services/` layer.
- **Observability**: Many hooks (e.g., `useSwarmVitals.ts`) expose observable state to the HUD/Dashboard components for real-time monitoring.
- **Interoperability**: Hooks interact with the central synchronization services (Appwrite, multiplayer state) to ensure UI consistency across all Sovereign sessions.

## Categorization

- **State Management**: `useWorkflowState`, `useCRMState`, `useOperationsState`.
- **System/Infrastructure**: `useAccessKeysState`, `useInfraMetrics`, `useMultiplayer`.
- **Component Utilities**: `useDraggable`, `useDebounce`, `useBreakpoint`.

## Usage Guideline
- Do not call service methods directly from components. Always wrap them in a custom hook to provide a consistent interface for the UI and handle necessary side effects (e.g., notifications, telemetry logging).
