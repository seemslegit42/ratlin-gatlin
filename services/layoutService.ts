
/**
 * @file services/layoutService.ts
 * @description Provides auto-layout functionality for agent workflows using a Directed Acyclic Graph (DAG) layering algorithm.
 * Optimized for ΛΞVON OS aesthetic coherence, node legibility, and handling multiple disconnected workflows.
 */

import type { Agent, Connection } from '../types';

/**
 * Constants for layout spacing.
 */
const NODE_WIDTH = 340; 
const NODE_HEIGHT = 240; 
const START_X = 100;
const START_Y = 100;
const COMPONENT_PADDING = 150; 

/**
 * Helper to identify connected components in the graph (Undirected BFS).
 */
const findComponents = (agentIds: string[], connections: Connection[]): string[][] => {
    const adj: Record<string, string[]> = {};
    agentIds.forEach(id => adj[id] = []);
    
    // Build undirected adjacency list
    connections.forEach(c => {
        if (adj[c.from.agentId] !== undefined && adj[c.to.agentId] !== undefined) {
            adj[c.from.agentId].push(c.to.agentId);
            adj[c.to.agentId].push(c.from.agentId);
        }
    });
    
    const visited = new Set<string>();
    const components: string[][] = [];
    
    for (const id of agentIds) {
        if (!visited.has(id)) {
            const component: string[] = [];
            const queue = [id];
            visited.add(id);
            
            while (queue.length > 0) {
                const curr = queue.shift()!;
                component.push(curr);
                
                for (const neighbor of adj[curr]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            components.push(component);
        }
    }
    
    // Sort components by size (descending)
    return components.sort((a, b) => b.length - a.length);
};

/**
 * Layouts a single connected component using a rank-based barycentric approach.
 */
const layoutComponent = (
    componentIds: string[], 
    connections: Connection[], 
    offsetY: number
): { positions: Record<string, { x: number, y: number }>, height: number } => {
    
    if (componentIds.length === 0) return { positions: {}, height: 0 };

    // 1. Build Directed Graph & Calculate In-Degrees
    const adj: Record<string, string[]> = {};      // Outgoing
    const revAdj: Record<string, string[]> = {};   // Incoming
    const inDegree: Record<string, number> = {};
    
    componentIds.forEach(id => {
        adj[id] = [];
        revAdj[id] = [];
        inDegree[id] = 0;
    });

    connections.forEach(conn => {
        if (componentIds.includes(conn.from.agentId) && componentIds.includes(conn.to.agentId)) {
            adj[conn.from.agentId].push(conn.to.agentId);
            revAdj[conn.to.agentId].push(conn.from.agentId);
            inDegree[conn.to.agentId]++;
        }
    });

    // 2. Assign Ranks (Longest Path Layering)
    const ranks: Record<string, number> = {};
    const queue: string[] = componentIds.filter(id => inDegree[id] === 0);
    
    // Fallback for cycles: if no root, pick arbitrary node
    if (queue.length === 0 && componentIds.length > 0) {
        queue.push(componentIds[0]);
    }

    queue.forEach(id => ranks[id] = 0);
    
    // Nodes not yet ranked (for cycle handling)
    componentIds.forEach(id => {
        if (ranks[id] === undefined) ranks[id] = 0; // Default rank 0
    });

    const workQueue = [...queue];
    let maxRank = 0;
    
    // BFS to assign ranks based on dependencies
    let safety = 0;
    while (workQueue.length > 0 && safety < componentIds.length * 3) {
        const u = workQueue.shift()!;
        safety++;
        
        adj[u].forEach(v => {
            const newRank = ranks[u] + 1;
            if (ranks[v] === undefined || ranks[v] < newRank) {
                ranks[v] = newRank;
                maxRank = Math.max(maxRank, newRank);
                // Simple cycle prevention: limit rank depth
                if (newRank < componentIds.length) {
                    workQueue.push(v);
                }
            }
        });
    }

    // 3. Group Nodes by Rank (Layers)
    const layers: string[][] = Array.from({ length: maxRank + 1 }, () => []);
    componentIds.forEach(id => {
        const r = ranks[id];
        // Safety clamp if cycle pushed rank too high
        const safeRank = Math.min(r, maxRank); 
        if (layers[safeRank]) layers[safeRank].push(id);
        else layers[0].push(id); // Fallback
    });

    // 4. Barycentric Positioning with Collision Resolution
    const yPositions: Record<string, number> = {};
    
    // Initialize Rank 0: Stack vertically starting from 0
    // To center later, we will compute height.
    layers[0].forEach((id, idx) => {
        yPositions[id] = idx * NODE_HEIGHT;
    });

    // Propagate forward
    for (let r = 1; r <= maxRank; r++) {
        const layer = layers[r];
        
        // Calculate desired Y based on average of parents
        const desiredY: { id: string, y: number }[] = layer.map(id => {
            const parents = revAdj[id].filter(pId => ranks[pId] < r);
            if (parents.length === 0) {
                // No parents, try to inherit Y from previous rank average or default
                return { id, y: 0 }; 
            }
            const avgY = parents.reduce((sum, p) => sum + (yPositions[p] || 0), 0) / parents.length;
            return { id, y: avgY };
        });

        // Sort by desired Y to minimize crossings and establish order
        desiredY.sort((a, b) => a.y - b.y);

        // Assign actual Y coordinates using "Push Down" logic to prevent overlaps
        // We ensure that each node is at least NODE_HEIGHT below the previous node
        // BUT also as close as possible to its desired Y.
        
        let currentY = -Infinity; // Tracks the bottom of the previously placed node

        desiredY.forEach((item) => {
            let y = item.y;
            
            // Correction: If the desired Y causes overlap with the previous node in this layer, push it down.
            // Ideally, we want the node center to be at 'y', but we are positioning top-left.
            // Let's treat yPositions as top-left coordinate.
            
            // If the desired position is above the minimum safe position, push it down.
            if (y < currentY + NODE_HEIGHT) {
                y = currentY + NODE_HEIGHT;
            }
            
            // If the desired position is way below, we allow it (gap), 
            // unless we want to compact it? Let's allow gaps for better alignment.
            
            yPositions[item.id] = y;
            currentY = y;
        });
        
        // Optional: Re-center layer vertically relative to previous layer to reduce drift
        // (Skipped for simplicity, the push-down logic is usually sufficient for DAGs)
    }

    // 5. Final Coordinate Assignment & Normalization
    const positions: Record<string, { x: number, y: number }> = {};
    
    let minY = Infinity;
    let maxY = -Infinity;
    
    // Find bounds to normalize Y to 0-based relative for this component
    Object.values(yPositions).forEach(y => {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });
    
    const componentHeight = (maxY - minY) + NODE_HEIGHT;

    // Apply X and Y
    componentIds.forEach(id => {
        const r = ranks[id];
        // Shift Y so the component starts at 0 relative, then add global offsetY
        const relativeY = (yPositions[id] || 0) - minY;
        
        positions[id] = {
            x: START_X + (r * NODE_WIDTH),
            y: offsetY + relativeY
        };
    });

    return { positions, height: componentHeight };
};

/**
 * Automatically arranges agents into layers based on their logical dependencies.
 */
export const applyAutoLayout = (
    agents: Record<string, Agent>,
    connections: Connection[]
): Record<string, Agent> => {
    const agentList = Object.values(agents);
    if (agentList.length === 0) return agents;

    const agentIds = agentList.map(a => a.id);
    const components = findComponents(agentIds, connections);
    
    const newAgents = { ...agents };
    let currentOffsetY = START_Y;

    components.forEach(componentIds => {
        const layout = layoutComponent(componentIds, connections, currentOffsetY);
        
        // Apply positions
        Object.entries(layout.positions).forEach(([id, pos]) => {
            if (newAgents[id]) {
                newAgents[id] = {
                    ...newAgents[id],
                    position: pos
                };
            }
        });

        // Increment offset for next component
        currentOffsetY += layout.height + COMPONENT_PADDING;
    });

    return newAgents;
};
