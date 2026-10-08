/**
 * @file hooks/useWorkflowExecutor.ts
 * @description Orchestrates the execution of agentic units and boons within the ΛΞVON OS.
 */

import React, { useCallback } from 'react';
import type { Agent, Connection, ChronicleEvent, Crew, OperationTask, ChatMessage, Moodlet, JsonObject, JsonValue, CurrentUser } from '../types.js';
import { AgentStatus, AgentType, ChronicleEventType, MessageSource, BoonType } from '../types.js';
import * as ollamaService from '../services/ollamaService.js';
import { DEFAULT_AGENT_LLM_MODEL } from '../services/llmDefaults.js';
import * as workflowService from '../services/workflowService.js';
import { validateIntent } from '../services/aegisService.js';
import { calculateOutcome } from '../services/klepsydraService.js';
import { useAuth } from '../contexts/AuthContext.js';
import { dispatchWorkflowCompleteHygiene } from './useFileManagement.js';

export const useWorkflowExecutor = (
    agents: Record<string, Agent>,
    connections: Connection[],
    crews: Record<string, Crew>,
    updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>,
    logEvent: (event: Omit<ChronicleEvent, 'id' | 'timestamp' | 'syndicateId'>) => void,
    addNotification: (message: string, type?: 'success' | 'error' | 'info') => void,
    takeSnapshot: () => void,
    setIsWorkflowExecuting: React.Dispatch<React.SetStateAction<boolean>>,
    syndicateId: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    addTask?: (task: Omit<OperationTask, 'id' | 'status' | 'syndicateId'>) => Promise<OperationTask>
) => {
    const { currentUser, updateUser } = useAuth();

    /**
     * Manifests a Boon to the Sovereign.
     */
    const manifestBoon = useCallback(async (instrumentId: string, tribute: number) => {
        if (!currentUser) return;

        try {
            const outcome = await calculateOutcome(currentUser, instrumentId, tribute);
            
            // 1. Transaction: Silent credit (Update User State)
            const updates: Partial<CurrentUser> = {};
            if (outcome.boonType === BoonType.XI) updates.xiBalance = currentUser.xiBalance + outcome.boonAmount;
            else if (outcome.boonType === BoonType.POTENTIAL) updates.phiBalance = currentUser.phiBalance + outcome.boonAmount;
            else if (outcome.boonType === BoonType.RESONANCE) updates.resonanceScore = Math.min(100, currentUser.resonanceScore + 5);
            
            await updateUser(updates);

            // 2. Manifestation: Diegetic Notification
            addNotification(outcome.narrativeTrigger, outcome.boonAmount > 0 ? 'success' : 'info');

            // 3. Manifestation: BEEP Narrative Confirmation
            setMessages(prev => [...prev, {
                id: `boon-${Date.now()}`,
                syndicateId: currentUser.syndicateId,
                content: outcome.narrativeTrigger,
                text: outcome.narrativeTrigger,
                source: MessageSource.BEEP,
                userName: 'BEEP',
                timestamp: Date.now()
            }]);

        } catch (e) {
            console.error("Boon Manifestation Failed:", e);
        }
    }, [currentUser, updateUser, addNotification, setMessages]);

    /**
     * Executes a single agentic task with real AI/API backends.
     */
    const runAgent = useCallback(async (agentId: string, inputData?: JsonObject): Promise<JsonValue | void> => {
        const agent = agents[agentId];
        if (!agent) return;

        const verdict = validateIntent(agent.description || agent.name);
        if (!verdict.allowed) {
            const msg = `AEGIS BLOCK: ${verdict.reason}`;
            await updateAgent(agentId, { status: AgentStatus.Error, outputData: { error: msg } });
            addNotification(msg, 'error');
            logEvent({ type: ChronicleEventType.SYSTEM, source: 'AEGIS', message: msg });
            return;
        }

        // Efficiency is tied to Cognitive Capacity
        const efficiency = agent.needs.cognitive / 100;
        if (efficiency < 0.2) {
            const msg = `${agent.name} is in deep burnout. Execution failed.`;
            await updateAgent(agentId, { status: AgentStatus.Error, outputData: { error: "Cognitive Exhaustion" } });
            addNotification(msg, 'error');
            return;
        }

        await updateAgent(agentId, { 
            status: AgentStatus.Running,
        });

        logEvent({ type: ChronicleEventType.AGENT, source: agent.name, message: `Processing synaptic ingress...` });

        try {
            let outputData: JsonObject | null = null;
            const contextString = JSON.stringify(inputData || {});

            switch (agent.type) {
                case AgentType.Input:
                    outputData = typeof agent.data.inputData === 'string' 
                        ? JSON.parse(agent.data.inputData) 
                        : (agent.data.inputData as JsonObject) || {};
                    break;

                case AgentType.CognitiveCore:
                    /* Fix: Explicitly cast agent data properties to string where needed */
                    const response = await ollamaService.runCognitiveCore(
                        (agent.data.prompt as string) || 'Synthesize results.', 
                        contextString, 
                        agent.persona, 
                        agent.model || DEFAULT_AGENT_LLM_MODEL,
                        crews[agent.crewId || ''] || null,
                        agent.interactionStyle
                    );
                    outputData = { result: response, ts: Date.now() };
                    
                    // Add a positive moodlet on success
                    const successMoodlet: Moodlet = {
                        name: 'Pleased with Task Outcome',
                        valence: 'Positive',
                        intensity: 8,
                        source: 'task_success',
                        decayRate: 0.1
                    };
                    await updateAgent(agentId, { moodlets: [...agent.moodlets, successMoodlet] });

                    if (Math.random() > 0.8) {
                      void manifestBoon('cognitive-achievement', 10);
                    }
                    break;

                case AgentType.DataTransformer:
                    outputData = await ollamaService.runDataTransformer(
                        (agent.data.transformationInstruction as string) || 'Format as structured JSON', 
                        inputData || {}
                    );
                    break;

                case AgentType.Condition:
                    const isMet = await ollamaService.runConditionEvaluator(
                        (agent.data.condition as string) || 'true', 
                        inputData || {}
                    );
                    outputData = { result: isMet ? 'true' : 'false' };
                    break;

                case AgentType.ApiCall:
                    /* Fix: Cast headers and body for runApiCall to satisfy JsonObject constraints */
                    outputData = await ollamaService.runApiCall(
                        (agent.data.method as string) || 'GET',
                        (agent.data.url as string) || '',
                        agent.data.headers as JsonObject | undefined,
                        agent.data.body as JsonObject | string | undefined
                    );
                    break;

                case AgentType.ImageGeneration:
                    /* Fix: Cast agent.data.prompt to string for image generation call */
                    const imgRes = await ollamaService.runImageGeneration((agent.data.prompt as string) || 'A digital nebula');
                    outputData = imgRes as unknown as JsonObject;
                    break;

                case AgentType.ManualTask:
                    if (addTask) {
                        const realTask = await addTask({
                            title: `Direct Action: ${agent.name}`,
                            assignee: (agent.data.assignee as string) || 'Sovereign',
                            due: new Date().toISOString().split('T')[0],
                            priority: 'High',
                            location: 'System Command'
                        });
                        outputData = { taskId: realTask.id, status: 'Awaiting Human Signature' };
                        await updateAgent(agentId, { status: AgentStatus.WAITING_FOR_HUMAN, outputData });
                        return outputData;
                    }
                    outputData = { error: "Operations module link severed." };
                    break;

                default:
                    outputData = { success: true, meta: "Generic execution protocol" };
            }
            
            await updateAgent(agentId, { 
                status: AgentStatus.Success, 
                outputData, 
                metrics: { 
                    ...agent.metrics, 
                    resilience: Math.min(100, agent.metrics.resilience + 2),
                    celerity: Math.min(100, agent.metrics.celerity + 1)
                } 
            });

            logEvent({ type: ChronicleEventType.AGENT, source: agent.name, message: `Ingress complete. Output synthesized.` });
            return outputData;

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Synaptic fault";
            
            // Add negative moodlet
            const failMoodlet: Moodlet = {
                name: 'Frustrated by Failure',
                valence: 'Negative',
                intensity: 9,
                source: 'task_failure',
                decayRate: 0.2
            };

            await updateAgent(agentId, { 
                status: AgentStatus.Error, 
                outputData: { error: errMsg },
                metrics: { ...agent.metrics, resilience: Math.max(0, agent.metrics.resilience - 10) },
                moodlets: [...agent.moodlets, failMoodlet]
            });
            logEvent({ type: ChronicleEventType.AGENT, source: agent.name, message: `Node failure: ${errMsg}` });
            throw error;
        }
    }, [agents, crews, updateAgent, logEvent, addNotification, addTask, manifestBoon]);

    const runCrew = useCallback(async (crewId: string) => {
        const crew = crews[crewId];
        if (!crew) {
            addNotification("Target crew not found in registry.", "error");
            return;
        }

        const crewAgentIds = crew.agentIds.filter(id => agents[id]);
        if (crewAgentIds.length === 0) {
            addNotification("Crew is empty. No agents to execute.", "info");
            return;
        }

        addNotification(`Initiating Crew Protocol: ${crew.name}`, "info");
        logEvent({ type: ChronicleEventType.SYSTEM, source: 'COMMAND', message: `Executing Crew: ${crew.name} (${crewAgentIds.length} members)` });

        crewAgentIds.forEach(id => {
            void updateAgent(id, { status: AgentStatus.Pending });
        });

        const results = await Promise.allSettled(crewAgentIds.map(id => runAgent(id)));
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        addNotification(`Crew Protocol Complete. ${successCount}/${crewAgentIds.length} successful.`, successCount === crewAgentIds.length ? 'success' : 'error');
        takeSnapshot();

    }, [crews, agents, runAgent, updateAgent, logEvent, addNotification, takeSnapshot]);

    const runAllAgents = useCallback(async () => {
        setIsWorkflowExecuting(true);
        addNotification("Initiating global swarm execution...", "info");
        
        try {
            await workflowService.runWorkflow(
                agents, 
                connections, 
                updateAgent, 
                runAgent, 
                logEvent, 
                syndicateId
            );
            addNotification("Swarm coordination stabilized.", "success");
            takeSnapshot();
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : "unknown error";
            addNotification(`Loom stalled: ${errMsg}`, 'error');
        } finally {
            setIsWorkflowExecuting(false);
            dispatchWorkflowCompleteHygiene();
        }
    }, [agents, connections, updateAgent, runAgent, logEvent, syndicateId, setIsWorkflowExecuting, takeSnapshot, addNotification]);

    return { runAgent, runCrew, runAllAgents, manifestBoon };
};
