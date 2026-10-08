
/**
 * @file hooks/useDependencyMap.ts
 * @description Analyzes the Agent graph to determine execution stages, 
 * path causalities, and logical conflicts.
 */

import { useMemo } from 'react';
import type { Agent, Connection } from '../types';

export interface DependencyAnalysis {
    stages: Record<string, number>; // AgentId -> Stage Rank
    conflicts: string[]; // Agent IDs involved in loops
    parallelGroups: string[][]; // Array of agent IDs that can run together
    criticalPathIds: Set<string>; // IDs of agents/connections in current focus path
    maxStage: number;
}

export const useDependencyMap = (
    agents: Record<string, Agent>,
    connections: Connection[],
    selectedAgentId: string | null
): DependencyAnalysis => {
    return useMemo(() => {
        const agentIds = Object.keys(agents);
        const inDegree: Record<string, number> = {};
        const adj: Record<string, string[]> = {};
        const reverseAdj: Record<string, string[]> = {};
        
        agentIds.forEach(id => {
            inDegree[id] = 0;
            adj[id] = [];
            reverseAdj[id] = [];
        });

        connections.forEach(conn => {
            if (agents[conn.from.agentId] && agents[conn.to.agentId]) {
                adj[conn.from.agentId].push(conn.to.agentId);
                reverseAdj[conn.to.agentId].push(conn.from.agentId);
                inDegree[conn.to.agentId]++;
            }
        });

        // 1. Topological Stage Calculation (Kahn's variation for stages)
        const stages: Record<string, number> = {};
        const parallelGroups: string[][] = [];
        let currentQueue = agentIds.filter(id => inDegree[id] === 0);
        let stageCount = 0;

        const tempInDegree = { ...inDegree };

        while (currentQueue.length > 0) {
            parallelGroups[stageCount] = [...currentQueue];
            const nextQueue: string[] = [];
            
            currentQueue.forEach(u => {
                stages[u] = stageCount;
                adj[u].forEach(v => {
                    tempInDegree[v]--;
                    if (tempInDegree[v] === 0) nextQueue.push(v);
                });
            });

            currentQueue = nextQueue;
            stageCount++;
        }

        // 2. Conflict Detection (Any unprocessed node is part of a cycle)
        const conflicts = agentIds.filter(id => stages[id] === undefined);

        // 3. Path Isolation (Causal Chain for Selection)
        const criticalPathIds = new Set<string>();
        if (selectedAgentId) {
            const traverse = (id: string, map: Record<string, string[]>) => {
                if (criticalPathIds.has(id)) return;
                criticalPathIds.add(id);
                (map[id] || []).forEach(next => traverse(next, map));
            };
            traverse(selectedAgentId, adj); // Downstream
            traverse(selectedAgentId, reverseAdj); // Upstream
        }

        return {
            stages,
            conflicts,
            parallelGroups,
            criticalPathIds,
            maxStage: stageCount - 1
        };
    }, [agents, connections, selectedAgentId]);
};
