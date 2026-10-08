/**
 * @file services/agentFactory.ts
 * @description Factory service for creating and configuring new Agent instances.
 */

import { nanoid } from 'nanoid';
import type { Agent, AgentTemplate, Connection, InteractionStyle, MemoryStore } from '../types';
import { AgentType, AgentStatus } from '../types';
import { DEFAULT_AGENT_LLM_MODEL } from './llmDefaults';

export interface AgentCreationResult {
    agents: Record<string, Agent>;
    connections: Connection[];
}

const DEFAULT_METRICS = { clarity: 100, celerity: 100, acuity: 100, resilience: 95, iqi: 50 };
const DEFAULT_NEEDS = { cognitive: 100, data: 100, social: 100, integrity: 100 };

const INITIAL_MEMORY: MemoryStore = {
    working: 'Initialization Sequence Active.',
    episodic: [],
    semantic: ['ΛΞVON OS Protocol V9', 'Project Magenta Ki Cognitive Core'],
    procedural: ['Protocol 1: Observe Environment', 'Protocol 2: Update Working Memory']
};

const AGENT_BEHAVIORS: Record<AgentType, { persona: string; goals: string[]; interactionStyle: InteractionStyle }> = {
    [AgentType.Input]: { persona: 'Data Ingress Specialist', goals: ['Accept and validate input data', 'Initiate workflow'], interactionStyle: 'technical' },
    [AgentType.Start]: { persona: 'Workflow Initiator', goals: ['Begin the process flow'], interactionStyle: 'concise' },
    [AgentType.End]: { persona: 'Workflow Terminator', goals: ['Conclude the process and signal completion'], interactionStyle: 'concise' },
    [AgentType.Trigger]: { persona: 'Event Listener', goals: ['Wait for an external signal', 'Trigger workflow on event'], interactionStyle: 'technical' },
    [AgentType.ManualTask]: { persona: 'Human-in-the-Loop Coordinator', goals: ['Pause execution', 'Await human input or approval', 'Resume workflow'], interactionStyle: 'conversational' },
    [AgentType.CognitiveCore]: { persona: 'Lead Strategist', goals: ['Analyze input', 'Generate novel insights', 'Produce comprehensive output'], interactionStyle: 'conversational' },
    [AgentType.DataTransformer]: { persona: 'Data Alchemist', goals: ['Restructure data', 'Format output as requested', 'Ensure data integrity'], interactionStyle: 'technical' },
    [AgentType.Output]: { persona: 'Data Egress Specialist', goals: ['Format final output', 'Deliver result to destination'], interactionStyle: 'technical' },
    [AgentType.ApiCall]: { persona: 'External Systems Liaison', goals: ['Interface with third-party APIs', 'Fetch or send data reliably', 'Handle API errors'], interactionStyle: 'technical' },
    [AgentType.Condition]: { persona: 'Logic Arbiter', goals: ['Evaluate a condition', 'Branch execution based on the result'], interactionStyle: 'concise' },
    [AgentType.CronTrigger]: { persona: 'Temporal Coordinator', goals: ['Execute at scheduled intervals'], interactionStyle: 'technical' },
    [AgentType.KnowledgeRetrieval]: { persona: 'Archivist', goals: ['Search knowledge base', 'Retrieve relevant documents', 'Provide context to other agents'], interactionStyle: 'conversational' },
    [AgentType.WebScraper]: { persona: 'Harvester', goals: ['Access web URLs', 'Extract relevant text/data', 'Cleanse HTML noise'], interactionStyle: 'technical' },
    [AgentType.Router]: { persona: 'Semantic Dispatcher', goals: ['Analyze input content', 'Route data to the appropriate downstream agent'], interactionStyle: 'concise' },
    [AgentType.EmailAction]: { persona: 'Communications Officer', goals: ['Draft and send emails', 'Confirm delivery'], interactionStyle: 'conversational' },
    [AgentType.CampaignManager]: { persona: 'Marketing Orchestrator', goals: ['Plan campaign steps', 'Coordinate marketing agents', 'Track campaign progress'], interactionStyle: 'conversational' },
    [AgentType.Copywriter]: { persona: 'Creative Wordsmith', goals: ['Generate compelling copy', 'Adhere to brand voice', 'Revise based on feedback'], interactionStyle: 'conversational' },
    [AgentType.SEOAnalyzer]: { persona: 'Digital Scout', goals: ['Analyze keywords', 'Check on-page SEO factors', 'Suggest improvements'], interactionStyle: 'technical' },
    [AgentType.SocialPoster]: { persona: 'Public Relations Bot', goals: ['Publish content to social platforms', 'Monitor engagement'], interactionStyle: 'conversational' },
    [AgentType.BrandGuard]: { persona: 'Compliance Officer', goals: ['Scan content for brand safety', 'Flag policy violations'], interactionStyle: 'concise' },
    [AgentType.CMSPublisher]: { persona: 'Content Deployer', goals: ['Interface with CMS', 'Publish articles or pages', 'Handle revisions'], interactionStyle: 'technical' },
    [AgentType.AnalyticsTracker]: { persona: 'Data Scribe', goals: ['Track key metrics', 'Report on performance'], interactionStyle: 'technical' },
    [AgentType.ImageGeneration]: { persona: 'Digital Artisan', goals: ['Create images from prompts', 'Refine visual concepts'], interactionStyle: 'concise' },
    [AgentType.ImageEditing]: { persona: 'Image Manipulator', goals: ['Edit images based on instructions'], interactionStyle: 'concise' },
    [AgentType.VisionAnalysis]: { persona: 'Observer', goals: ['Analyze visual data', 'Describe image contents'], interactionStyle: 'technical' },
    [AgentType.CodeExecution]: { persona: 'System Executor', goals: ['Run code securely', 'Return output'], interactionStyle: 'technical' },
    [AgentType.WasmExecutor]: { persona: 'High-Performance Core', goals: ['Execute compiled WASM modules', 'Perform computationally intensive tasks'], interactionStyle: 'technical' },
    [AgentType.MicroApp]: { persona: 'Custom Tool Operator', goals: ['Execute the logic defined in its Forge blueprint'], interactionStyle: 'technical' },
    [AgentType.Notification]: { persona: 'Town Crier', goals: ['Send alerts to designated channels'], interactionStyle: 'concise' },
    [AgentType.Prompt]: { persona: 'Context Injector', goals: ['Provide specific instructions to downstream agents'], interactionStyle: 'concise' },
    [AgentType.MCP_Bridge]: { persona: 'Bridge Operator', goals: ['Connect external MCP servers'], interactionStyle: 'technical' },
    [AgentType.Vortex_Vanguard]: { persona: 'High-Velocity Executor', goals: ['Execute tasks with maximum speed'], interactionStyle: 'concise' },
};

export const createAgent = (
    syndicateId: string, 
    type: AgentType, 
    template?: AgentTemplate, 
    positionOverride?: { x: number, y: number }
): Agent => {
    const behavior = AGENT_BEHAVIORS[type] || AGENT_BEHAVIORS[AgentType.CognitiveCore];

    return {
        id: nanoid(),
        syndicateId,
        kind: 'agent',
        name: template?.name || `New ${type}`,
        description: template?.description || '',
        type,
        status: AgentStatus.Idle,
        position: positionOverride || { x: 200, y: 200 },
        data: template?.data || {},
        outputData: null,
        /* Fix: Cast JsonValue avatar to string */
        avatar: (template?.data?.avatar as string) || 'golem',
        metrics: { ...DEFAULT_METRICS },
        needs: { ...DEFAULT_NEEDS },
        memory: { ...INITIAL_MEMORY },
        moodlets: [],
        mood: 'Dormant',
        persona: template?.persona || behavior.persona,
        /* Fix: Cast JsonValue goals to string[] to resolve type mismatch */
        goals: template?.goals || ((template?.data?.goals as string[]) || behavior.goals),
        interactionStyle: behavior.interactionStyle,
        role: type,
        model: template?.model || DEFAULT_AGENT_LLM_MODEL,
        specialization: template?.specialization || '',
        crewId: undefined,
        isVeiled: false
    };
};

export const instantiateBlueprint = (
    syndicateId: string,
    type: AgentType,
    template?: AgentTemplate,
    centerPosition: { x: number, y: number } = { x: 200, y: 200 }
): AgentCreationResult => {
    const result: AgentCreationResult = { agents: {}, connections: [] };

    if (template?.blueprint) {
        const { agents: bpAgents, connections: bpConnections } = template.blueprint;
        const idMap: Record<string, string> = {};

        bpAgents.forEach(bpAgent => {
            const realId = nanoid();
            idMap[bpAgent.id] = realId;
            result.agents[realId] = {
                ...createAgent(syndicateId, bpAgent.type, undefined, { 
                    x: centerPosition.x + bpAgent.relativePosition.x, 
                    y: centerPosition.y + bpAgent.relativePosition.y 
                }),
                id: realId,
                name: bpAgent.name,
                description: bpAgent.description,
                data: bpAgent.data || {},
                persona: bpAgent.persona,
                model: bpAgent.model,
                mood: 'Ebullient'
            };
        });

        bpConnections.forEach(bpConn => {
            const fromId = idMap[bpConn.from];
            const toId = idMap[bpConn.to];
            if (fromId && toId) {
                result.connections.push({
                    id: nanoid(),
                    syndicateId,
                    from: { agentId: fromId, portId: bpConn.fromPort || 'default' },
                    to: { agentId: toId, portId: 'default' },
                });
            }
        });
    } else {
        const agent = createAgent(syndicateId, type, template, centerPosition);
        result.agents[agent.id] = agent;
    }
    return result;
};

export const generateSeedState = (syndicateId: string): AgentCreationResult => {
    const s1 = 'agent-1';
    const s2 = nanoid();
    return {
        agents: {
            [s1]: { 
                ...createAgent(syndicateId, AgentType.Input, undefined, { x: 100, y: 300 }), 
                id: s1, 
                name: 'Synaptic Root',
                avatar: 'brain',
                description: 'The primary conduit for Sovereign intent.',
                mood: 'Ebullient'
            },
            [s2]: { 
                ...createAgent(syndicateId, AgentType.CognitiveCore, undefined, { x: 500, y: 300 }), 
                id: s2, 
                name: 'Aetheria Core', 
                mood: 'Pensive',
                description: 'A deep-reasoning node for complex synthesis.'
            }
        },
        connections: [{ id: nanoid(), syndicateId, from: { agentId: s1, portId: 'default' }, to: { agentId: s2, portId: 'default' } }]
    };
};