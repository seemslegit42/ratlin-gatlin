
/**
 * @file hooks/useKlepsydra.ts
 * @description The "Klepsydra Engine" - A psychological engagement and agent wellness monitor.
 * Implements the Burnout Algorithm: Agents' Cognitive Capacity drains non-linearly like a water clock.
 * Calculates global EVE (Emotional Value Equivalent) to generate Xi currency.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { KlepsydraMetric, KlepsydraState, Agent, CurrentUser, Moodlet } from '../types';

const INITIAL_STATE: KlepsydraMetric = {
    flowScore: 50,
    state: 'Flow',
    streak: 0,
    lastActionTimestamp: Date.now(),
};

const BOREDOM_THRESHOLD = 30;
const ANXIETY_THRESHOLD = 80;
const HEARTBEAT_INTERVAL = 5000; // 5 seconds for more responsive simulation

export const useKlepsydra = (
    addNotification: (msg: string, type?: 'success' | 'error' | 'info') => void,
    agents: Record<string, Agent>,
    updateAgent: (id: string, updates: Partial<Agent>) => void,
    currentUser: CurrentUser | null,
    updateUser: (updates: Partial<CurrentUser>) => void
) => {
    const [metrics, setMetrics] = useState<KlepsydraMetric>(INITIAL_STATE);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // EVE Weights
    const W_POS = 1.2;
    const W_NEG = 1.5;

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            
            // 1. Calculate Global EVE and Generate Xi
            let totalEve = 0;
            Object.values(agents).forEach(agent => {
                agent.moodlets.forEach(m => {
                    const contribution = m.intensity * (m.valence === 'Positive' ? W_POS : m.valence === 'Negative' ? -W_NEG : 0);
                    totalEve += contribution;
                });
            });

            if (totalEve > 0 && currentUser) {
                const xiGained = Math.floor(totalEve * 0.1);
                if (xiGained > 0) {
                    updateUser({ xiBalance: currentUser.xiBalance + xiGained });
                }
            }

            // 2. Agent Metabolic Simulation (Burnout/Recovery)
            Object.values(agents).forEach(agent => {
                let { cognitive, data, social, integrity } = agent.needs;
                const isWorking = agent.status === 'Running' || agent.status === 'Pending';
                
                if (isWorking) {
                    // Torricelli's Law Approximation: Drain is proportional to current level (pressure)
                    // Pushing harder at high capacity, slowing down at low capacity
                    const pressure = cognitive / 100;
                    const drain = (0.5 + pressure) * 2; 
                    cognitive = Math.max(0, cognitive - drain);
                } else {
                    // Recovery Cycle
                    cognitive = Math.min(100, cognitive + 1);
                    data = Math.min(100, data + 0.5);
                    social = Math.min(100, social + 0.5);
                }

                // Decay Moodlets
                const activeMoodlets = agent.moodlets.map(m => ({
                    ...m,
                    intensity: Math.max(0, m.intensity - m.decayRate)
                })).filter(m => m.intensity > 0);

                if (cognitive !== agent.needs.cognitive || activeMoodlets.length !== agent.moodlets.length) {
                    updateAgent(agent.id, { 
                        needs: { ...agent.needs, cognitive, data, social, integrity },
                        moodlets: activeMoodlets
                    });
                }

                // Burnout Alert
                if (cognitive < 20 && agent.status !== 'Error') {
                    addNotification(`${agent.name} is approaching Burnout threshold.`, 'info');
                }
            });

            // 3. Global Flow Metrics
            setMetrics(prev => {
                const timeSinceLastAction = now - prev.lastActionTimestamp;
                let newScore = prev.flowScore;

                if (timeSinceLastAction > 60000) { 
                    newScore = Math.max(0, newScore - 0.5);
                }

                let newState: KlepsydraState = 'Flow';
                if (newScore <= BOREDOM_THRESHOLD) newState = 'Boredom';
                else if (newScore >= ANXIETY_THRESHOLD) newState = 'Anxiety';

                return {
                    ...prev,
                    flowScore: newScore,
                    state: newState,
                };
            });
        }, HEARTBEAT_INTERVAL);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [agents, currentUser, updateUser, updateAgent, addNotification]);

    const recordAction = useCallback((wasSuccessful: boolean) => {
        setMetrics(prev => {
            let newScore = prev.flowScore + (wasSuccessful ? 5 : -5);
            newScore = Math.min(100, Math.max(0, newScore));

            return {
                ...prev,
                flowScore: newScore,
                streak: wasSuccessful ? prev.streak + 1 : 0,
                lastActionTimestamp: Date.now(),
            };
        });
    }, []);

    return { metrics, recordAction };
};
