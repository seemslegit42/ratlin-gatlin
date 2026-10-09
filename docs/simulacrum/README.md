# Simulacrum (Agent Simulation)

The Simulacrum engine manages persistent, autonomous multi-agent environments.

## Overview
Simulacrum simulates agency by allowing agents (entities) to interact, exchange information, and modify the environment state in real-time.

## Key Concepts
- **Entities:** Autonomous actors with personality, goals, and internal states.
- **Tethers:** Communication channels between agents.
- **Gossip:** State propagation across the swarm.

## Implementation Details
- Located in `modules/simulacrum/`.
- Orchestrated by `services/chaosService.ts` and `services/simulatedApiService.ts`.

## Maintenance
- Be wary of agent "runaway" states; the `GossipTicker` acts as a heartbeat limiter to prevent infinite loops.
