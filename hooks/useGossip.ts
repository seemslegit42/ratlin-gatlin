
/**
 * @file hooks/useGossip.ts
 * @description A custom hook that generates a stream of "gossip" (inter-agent communications).
 * Implements the PCE (Psyche-Calibration Engine) narrative translation layer.
 */

import { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { Agent, GossipLogEntry } from '../types';
import { generateDynamicGossip } from '../services/ollamaService';

export const useGossip = (agents: Record<string, Agent>, enabled: boolean = false) => {
    const [gossipLog, setGossipLog] = useState<GossipLogEntry[]>([]);
    const [activeTethers, setActiveTethers] = useState<GossipLogEntry[]>([]);
    const [currentBubbles, setCurrentBubbles] = useState<Record<string, string>>({});
    
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!enabled) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        const scheduleGossip = () => {
            // Stochastic Interval: 30s to 60s
            const delay = Math.floor(Math.random() * (60000 - 30000 + 1) + 30000);
            
            timeoutRef.current = setTimeout(() => {
                void triggerGossip();
                scheduleGossip();
            }, delay);
        };

        const triggerGossip = async () => {
            if (!enabled) return;

            const agentList = Object.values(agents) as Agent[];
            if (agentList.length < 1) return;

            // 1. Pick Source
            const source = agentList[Math.floor(Math.random() * agentList.length)];
            
            // 2. Pick Target (optional)
            let target: Agent | undefined;
            if (agentList.length > 1 && Math.random() > 0.4) {
                target = agentList.find(a => a.id !== source.id); 
            }

            // 3. Generate Message via AI (PCE Translation)
            const message = await generateDynamicGossip(source, target);

            // 4. Create Entry
            const newEntry: GossipLogEntry = {
                id: nanoid(),
                sourceAgentId: source.id,
                targetAgentId: target?.id,
                message,
                timestamp: Date.now()
            };

            // 5. Update State
            setGossipLog(prev => [newEntry, ...prev].slice(0, 50));
            setCurrentBubbles(prev => ({ ...prev, [source.id]: message }));

            if (target) {
                setActiveTethers(prev => [...prev, newEntry]);
                setTimeout(() => {
                    setActiveTethers(prev => prev.filter(t => t.id !== newEntry.id));
                }, 5000);
            }

            // Clear bubble after delay
            setTimeout(() => {
                setCurrentBubbles(prev => {
                    const next = { ...prev };
                    delete next[source.id];
                    return next;
                });
            }, 8000);
        };

        scheduleGossip();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [agents, enabled]);

    return { gossipLog, activeTethers, currentBubbles };
};
