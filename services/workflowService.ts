import type { Agent, Connection, ChronicleEvent, JsonObject, JsonValue } from '../types';
import { AgentStatus, AgentType, ChronicleEventType } from '../types';

/**
 * Performs a topological sort on the agents graph to ensure correct dependency resolution.
 */
export const topologicalSort = (
  agents: Record<string, Agent>,
  connections: Connection[],
  syndicateId: string,
): string[] => {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  
  const syndicateAgents = Object.values(agents).filter(agent => agent.syndicateId === syndicateId);
  const syndicateConnections = connections.filter(conn => conn.syndicateId === syndicateId);
  const agentIds = syndicateAgents.map(agent => agent.id);

  for (const id of agentIds) {
    inDegree[id] = 0;
    adjList[id] = [];
  }

  for (const conn of syndicateConnections) {
    const from = conn.from.agentId;
    const to = conn.to.agentId;
    if (adjList[from] && inDegree[to] !== undefined) {
        adjList[from].push(to);
        inDegree[to]++;
    }
  }

  const queue = agentIds.filter(id => inDegree[id] === 0);
  const sortedOrder: string[] = [];

  while (queue.length > 0) {
    const u = queue.shift()!;
    sortedOrder.push(u);
    for (const v of adjList[u] || []) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }

  if (sortedOrder.length !== agentIds.length) {
    throw new Error('Neural feedback loop detected. Topological sort failed.');
  }

  return sortedOrder;
};

/**
 * Executes the workflow with deterministic result-merging.
 * Aggregates all upstream data into a single context object for the active node.
 */
export const runWorkflow = async (
    agents: Record<string, Agent>,
    connections: Connection[],
    onUpdateAgent: (id: string, updates: Partial<Agent>) => Promise<void>,
    onRunAgent: (agentId: string, combinedInput?: JsonObject) => Promise<JsonValue | void>,
    logEvent: (event: Omit<ChronicleEvent, 'id' | 'timestamp' | 'syndicateId'>) => void,
    syndicateId: string,
): Promise<void> => {
    try {
        const executionOrder = topologicalSort(agents, connections, syndicateId);
        const agentOutputs: Record<string, JsonValue> = {};

        // 1. Swarm Reset (Persistent)
        for (const agentId of executionOrder) {
            const agent = agents[agentId];
            if (agent.type !== AgentType.Input) {
                await onUpdateAgent(agentId, { status: AgentStatus.Idle, outputData: null });
            }
        }

        // 2. Linear/Parallel Sequential Execution
        for (const agentId of executionOrder) {
            const agent = agents[agentId];
            const syndicateConnections = connections.filter(c => c.syndicateId === syndicateId);
            const parentConnections = syndicateConnections.filter(c => c.to.agentId === agentId);
            
            // BRANCHING PROTOCOL: Verify if this node should be pruned based on upstream conditions
            let shouldPrune = false;
            for (const pc of parentConnections) {
                const parent = agents[pc.from.agentId];
                if (parent?.type === AgentType.Condition) {
                    const branchValue = agentOutputs[parent.id];
                    // If parent is a condition, its output is 'true' or 'false'
                    if (String(branchValue) !== pc.from.portId) {
                        shouldPrune = true;
                        break;
                    }
                }
            }

            if (shouldPrune) {
                await onUpdateAgent(agentId, { status: AgentStatus.Idle });
                continue;
            }

            // SYNAPTIC AGGREGATION: Collate input from all active parents
            let combinedInput: JsonObject = {};
            if (parentConnections.length > 0) {
                for (const pc of parentConnections) {
                    const out = agentOutputs[pc.from.agentId];
                    if (out !== undefined && out !== null) {
                        const parentName = agents[pc.from.agentId]?.name.replace(/\s+/g, '_').toLowerCase() || pc.from.agentId;
                        
                        // Deep Merge logic
                        if (typeof out === 'object' && !Array.isArray(out)) {
                            combinedInput = { ...combinedInput, ...(out as JsonObject) };
                        } else {
                            combinedInput[parentName] = out;
                        }
                    }
                }
            }

            try {
                // Real execution call
                const result = await onRunAgent(agentId, combinedInput);
                /* Fix: Cast result to JsonValue after confirming it is not undefined (void) to satisfy Record typing */
                if (result !== undefined) {
                    agentOutputs[agentId] = result as JsonValue;
                }
            } catch (e) {
                logEvent({ 
                    type: ChronicleEventType.SYSTEM, 
                    message: `Workflow Aborted: Fatal synaptic fault in node ${agent.name}` 
                });
                return;
            }
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "unknown error";
        logEvent({ type: ChronicleEventType.SYSTEM, message: `Loom Engine Error: ${msg}` });
    }
};
