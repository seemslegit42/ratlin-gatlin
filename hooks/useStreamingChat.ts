/**
 * @file hooks/useStreamingChat.ts
 * @description The primary conversational bridge between the Sovereign and BEEP.
 * Orchestrates multi-turn Architect workflows with auto-layout and onboarding triggers.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, View, Agent, Connection, WidgetData, NavigationWidgetData, CurrentUser, InteractionStyle, OperationTask, JsonObject, AgentTemplate, CRMDeal, CRMContact, Settings, TaskWidgetData, MorningBriefWidgetData, RevenueChartWidgetData, SecurityAlertWidgetData, WorkflowScaffoldWidgetData, CashFlowWidgetData } from '../types.js';
import { MessageSource, WidgetType, AgentStatus, AgentType } from '../types.js';
import type { LlmResponse } from '../services/ollamaService.js';
import { runMainframeChat, runWorkflowSynthesizer } from '../services/ollamaService.js';
import { generateWidgetData } from '../services/widgetService.js';
import { applyAutoLayout } from '../services/layoutService.js';
import { nanoid } from 'nanoid';
import { useRites } from './useRites.js'; // Added Rite hook for persona context
import { describeAttachment, logChatEvent, logDataEvent, logError } from '../services/appLogger.js';

function isLikelyAbortError(error: unknown, signal: AbortSignal): boolean {
  if (signal.aborted) return true;
  if (!(error instanceof DOMException) && !(error instanceof Error)) return false;
  return (error as Error).name === 'AbortError';
}

export const useStreamingChat = (
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  playSpeech: (text: string) => void,
  workflowContext: {
    agents: Record<string, Agent>;
    setAgents: React.Dispatch<React.SetStateAction<Record<string, Agent>>>;
    connections: Connection[];
    setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  },
  setForgeIconGlow: (glow: boolean) => void,
  currentUser: CurrentUser | null,
  interactionStyle: InteractionStyle = 'concise',
  addTask?: (task: Omit<OperationTask, 'id' | 'status' | 'syndicateId'>) => Promise<OperationTask>,
  crmContext?: { 
    addDeal: (deal: Omit<CRMDeal, 'id'>, stage?: string) => Promise<void>; 
    addContact: (contact: Omit<CRMContact, 'id'>) => Promise<void>;
    contacts: CRMContact[];
    deals: CRMDeal[];
  },
  procurementContext?: unknown,
  codexContext?: unknown,
  onNavigate?: (view: View) => void,
  startTutorial?: () => void,
  updateSettings?: (updates: Partial<Settings>) => void,
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isArchitectMode, setIsArchitectMode] = useState(false);
  const chatAbortRef = useRef<AbortController | null>(null);
  /** Bumps whenever a newer command supersedes an in-flight one (prevents spinner/glow races). */
  const chatTurnSeqRef = useRef(0);
  
  // Rite context for persona override
  const { activePersona } = useRites(); 

  // Sync History on Initialization
  // TODO: Persist chat transcript via Appwrite Databases API
  useEffect(() => {
    if (!currentUser?.syndicateId) return;

    const fetchHistory = async () => {
        // Appwrite migration pending
        // Messages will be loaded from Appwrite once integration is complete
    };

    void fetchHistory();
  }, [currentUser?.syndicateId, setMessages]);

  const saveMessageToDB = async (msg: ChatMessage) => {
      if (!currentUser?.syndicateId) return;
      // TODO: Persist chat transcript via Appwrite Databases API
      // Message persistence will be handled by Appwrite once integration is complete
  };

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp' | 'syndicateId'> & { syndicateId?: string }) => {
    const fullMsg: ChatMessage = {
      ...message,
      id: nanoid(),
      timestamp: Date.now(),
      syndicateId: message.syndicateId || currentUser?.syndicateId || 'anonymous',
    };
    setMessages(prev => [...prev, fullMsg]);
    return fullMsg;
  }, [setMessages, currentUser]);
  
  const updateLastMessage = useCallback((updater: (prev: ChatMessage) => ChatMessage) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next[next.length - 1] = updater(next[next.length - 1]);
      return next;
    });
  }, [setMessages]);

  const cancelActiveGeneration = useCallback(() => {
    chatTurnSeqRef.current += 1;
    chatAbortRef.current?.abort();
    setForgeIconGlow(false);
    setIsProcessing(false);
  }, [setForgeIconGlow]);

  const processStreamingCommand = useCallback(async (
      command: string, 
      currentView: View, 
      attachment?: { name: string, mimeType: string, data: string }
  ) => {
    if (!currentUser) return;
    chatAbortRef.current?.abort();
    chatTurnSeqRef.current += 1;
    const seq = chatTurnSeqRef.current;
    const controller = new AbortController();
    chatAbortRef.current = controller;
    const signal = controller.signal;

    setIsProcessing(true);
    setForgeIconGlow(true);
    logChatEvent('chat.command_start', {
      view: currentView,
      chars: command.trim().length,
      hasAttachment: Boolean(attachment),
      attachment: describeAttachment(attachment),
    });

    // 1. Ingress user intent
    const userMsg = addMessage({ 
        source: MessageSource.USER, text: command, content: command, 
        userName: currentUser.name, userColor: currentUser.color, isFinal: true,
        attachment
    }); 
    void saveMessageToDB(userMsg);

    // 2. Provision AI Placeholder
    const aiName = activePersona === 'ScionOfShame' ? 'SCION' : activePersona === 'Eulogist' ? 'EULOGIST' : 'BEEP';
    addMessage({ source: MessageSource.BEEP, text: '...', content: '...', userName: aiName, isFinal: false, syndicateId: currentUser.syndicateId });

    try {
      const history = await new Promise<ChatMessage[]>(resolve => setMessages(prev => { resolve(prev); return prev; }));
      
      const workflowKeywords = ['build', 'workflow', 'create system', 'manifest', 'blueprint', 'setup a process', 'design a'];
      const isWorkflowStartIntent = workflowKeywords.some(k => command.toLowerCase().includes(k));
      const isCancellation = /cancel|stop|abort|nevermind/i.test(command);
      
      if (isCancellation) {
          setIsArchitectMode(false);
          updateLastMessage(prev => ({
            ...prev,
            text: 'Architect mode disengaged. Standby.',
            content: 'Architect mode disengaged. Standby.',
            isFinal: true,
          }));
          logChatEvent('chat.architect_cancel', { view: currentView });
          return;
      }

      let response: LlmResponse;

      if (isArchitectMode || isWorkflowStartIntent) {
          if (!isArchitectMode) setIsArchitectMode(true); 

          logDataEvent('chat.workflow_synthesize_request', {
            chars: command.length,
            syndicateId: currentUser.syndicateId,
          });
          response = await runWorkflowSynthesizer(command, history, currentUser.syndicateId, signal);
          
          if (response.functionCalls?.length) {
              const call = response.functionCalls[0];
              if (call.name === 'createWorkflow') {
                  const args = call.args as unknown as { 
                      agents: Array<{ id: string, name: string, type: string, data: JsonObject }>,
                      connections: Array<{ from: string, to: string }> 
                  };
                  let newAgents: Record<string, Agent> = {};
                  const newConnections: Connection[] = [];
                  const idMap: Record<string, string> = {};

                  // Map agents from blueprint to real OS entities
                  args.agents.forEach((ba) => {
                      const realId = nanoid();
                      idMap[ba.id] = realId;
                      newAgents[realId] = {
                          id: realId,
                          syndicateId: currentUser.syndicateId,
                          kind: 'agent',
                          name: ba.name,
                          type: ba.type as AgentType,
                          status: AgentStatus.Idle,
                          position: { x: 0, y: 0 }, 
                          data: ba.data || {},
                          outputData: null,
                          metrics: { clarity: 100, celerity: 100, acuity: 100, resilience: 100, iqi: 50 },
                          needs: { cognitive: 50, data: 50, social: 50, integrity: 100 },
                          memory: { working: '', episodic: [], semantic: [], procedural: [] },
                          moodlets: [],
                          mood: 'Ebullient',
                          isVeiled: false
                      };
                  });

                  // Construct logical tethers
                  args.connections.forEach((bc) => {
                      newConnections.push({
                          id: nanoid(),
                          syndicateId: currentUser.syndicateId,
                          from: { agentId: idMap[bc.from], portId: 'default' },
                          to: { agentId: idMap[bc.to], portId: 'default' }
                      });
                  });

                  // --- APPLY OPTIMIZED DAG LAYOUT ---
                  newAgents = applyAutoLayout(newAgents, newConnections);

                  workflowContext.setAgents(newAgents);
                  workflowContext.setConnections(newConnections);

                  const successMsg = response.text || "Blueprint manifested. Transitioning to Weaver Studio for calibration.";
                  updateLastMessage(prev => ({ ...prev, text: successMsg, content: successMsg, isFinal: true }));
                  void playSpeech(successMsg);
                  
                  setIsArchitectMode(false); 

                  logChatEvent('chat.workflow_spawned', { agentCount: Object.keys(newAgents).length });
                  // Transit to Weaver
                  if (onNavigate) onNavigate('weaver');

                  // --- TRIGGER ONBOARDING RITUAL ---
                  if (!currentUser.hasOnboarded && startTutorial) {
                      // Slight delay to allow canvas mount
                      setTimeout(() => startTutorial(), 1500);
                  }
                  
                  return;
              }
          }

          const architectMsg =
            response.text ||
            'Architect channel did not manifest a blueprint. Rephrase, or specify agents and wires.';
          updateLastMessage(prev => ({
            ...prev,
            text: architectMsg,
            content: architectMsg,
            isFinal: true,
          }));
          if (architectMsg) playSpeech(architectMsg);
          logChatEvent('chat.workflow_fallback_text', { view: currentView });
          return;
      } else {
          // Standard HUD Interaction with Persona Override
          response = await runMainframeChat(
            command,
            history,
            currentUser.syndicateId,
            currentView,
            currentUser.covenant,
            interactionStyle,
            attachment,
            activePersona || undefined,
            signal,
          );
      }

      let widget: WidgetData | undefined;
      let responseText = response.text || 'Acknowledged.';

      if (response.functionCalls?.length) {
        const call = response.functionCalls[0];
        const args = call.args as JsonObject;

        if (call.name === 'navigate') {
            if (onNavigate) onNavigate(args.view as View);
            widget = { type: WidgetType.NAVIGATION, text: `Transit: ${args.view}`, targetView: args.view as View } as NavigationWidgetData;
        } else if (call.name === 'showWidget') {
            widget = generateWidgetData(args.widgetType as string, args.widgetParams as JsonObject);
        } else if (call.name === 'createTask') {
            if (addTask) {
                await addTask({
                    title: String(args.title),
                    due: String(args.dueDate || 'next Friday'),
                    assignee: String(args.assignee || 'Unassigned'),
                    description: String(args.description || ''),
                    priority: (args.priority as OperationTask['priority']) || 'Medium',
                });
                widget = { 
                    type: WidgetType.TASK, 
                    taskName: String(args.title), 
                    assignee: String(args.assignee || 'Unassigned'),
                    dueDate: String(args.dueDate || 'next Friday'),
                    priority: (args.priority as OperationTask['priority']) || 'Medium'
                } as TaskWidgetData;
            }
        } else if (call.name === 'updateSettings') {
            if (updateSettings) {
                updateSettings({
                    interactionStyle: (args.interactionStyle as InteractionStyle) || 'concise',
                    anomalySensitivity: Number(args.anomalySensitivity) || 50
                });
                responseText = `Preferences updated, Sovereign. Interaction style set to ${args.interactionStyle || 'concise'} and sensitivity to ${args.anomalySensitivity || 50}%.`;
            }
        } else if (call.name === 'getMorningBrief') {
            widget = {
                type: WidgetType.MORNING_BRIEF,
                date: new Date().toLocaleDateString(),
                securityStatus: 'Nominal',
                operationalHighlights: ['3 pending approvals', '2 overdue tasks'],
                financialOutlook: 'Positive growth'
            } as MorningBriefWidgetData;
        } else if (call.name === 'getOperationalMetrics') {
            widget = {
                type: WidgetType.REVENUE_CHART,
                title: 'Operational Velocity',
                totalValue: 92,
                currency: '%',
                breakdown: [
                    { label: 'Throughput', value: 88, color: 'var(--patina-green)' },
                    { label: 'Latency', value: 12, color: 'var(--roman-aqua)' },
                    { label: 'Uptime', value: 99, color: 'var(--imperial-purple)' }
                ]
            } as RevenueChartWidgetData;
        } else if (call.name === 'securityAction') {
            const action = String(args.action || 'scan');
            widget = {
                type: WidgetType.SECURITY_ALERT,
                severity: 'Low',
                alertTitle: `Security ${action.toUpperCase()} Executed`,
                description: `Action "${action}" performed on target "${args.target || 'System'}".`,
                recommendedAction: 'Monitor logs for further developments.',
                timestamp: new Date().toLocaleTimeString()
            } as SecurityAlertWidgetData;
            responseText = `Security protocol ${action} initiated, Sovereign. Target: ${args.target || 'Universal Phalanx'}.`;
        } else if (call.name === 'manageWorkflow') {
            const action = String(args.action || 'monitor');
            widget = {
                type: WidgetType.WORKFLOW_SCAFFOLD,
                workflowName: String(args.name || 'New Syndicate Protocol'),
                description: `Managing workflow via ${action} directive.`,
                estimatedNodes: 8,
                phases: [
                    { label: 'Ingress', agents: ['Oracle Node'] },
                    { label: 'Transmutation', agents: ['Cognitive Core', 'Data Transformer'] },
                    { label: 'Egress', agents: ['Notification Hub'] }
                ],
                completionPct: action === 'create' ? 10 : 85
            } as WorkflowScaffoldWidgetData;
            if (onNavigate && action === 'create') onNavigate('weaver');
        } else if (call.name === 'getBusinessInsights') {
            widget = {
                type: WidgetType.CASH_FLOW,
                title: 'Strategic Pulse',
                data: [
                    { label: 'Growth', value: 85 },
                    { label: 'Risk', value: 12 },
                    { label: 'Efficiency', value: 92 }
                ]
            } as CashFlowWidgetData;
        }
      }
      
      updateLastMessage(prev => ({ ...prev, text: responseText, content: responseText, widget: widget as unknown as JsonObject, isFinal: true }));
      if (responseText) playSpeech(responseText);
      void saveMessageToDB({ ...history[history.length-1], text: responseText, widget: widget as unknown as JsonObject, isFinal: true });
      logChatEvent('chat.command_complete', { view: currentView });

    } catch (error) {
      if (isLikelyAbortError(error, signal)) {
        updateLastMessage(prev =>
          prev.isFinal
            ? prev
            : { ...prev, text: 'Generation stopped.', content: 'Generation stopped.', isFinal: true },
        );
        logChatEvent('chat.command_aborted', { view: currentView });
        return;
      }
      console.error('[BEEP] Synaptic Fault:', error);
      logError('chat.command_failed', error, { view: currentView });
      const raw =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error.';
      const detail = raw.replace(/\s+/g, ' ').trim().slice(0, 220);
      const msg =
        `Synaptic fault: ${detail || 'directive cycle interrupted.'} ` +
        'Check Console + DevTools Network. Typical fixes: run `ollama serve`, import your GGUF (`bun run ollama:register-qwen-local`), `ollama list` shows your model tag, reload after changing .env. ' +
        'On `vite` dev, BEEP defaults to `/ollama` proxy (avoid CORS). Set `VITE_OLLAMA_DIRECT=true` only if Ollama allows your origin.';
      updateLastMessage(prev => ({
        ...prev,
        text: msg,
        content: msg,
        isFinal: true,
        userColor: '#EF4444',
      }));
    } finally {
      if (chatAbortRef.current === controller) {
        chatAbortRef.current = null;
      }
      if (chatTurnSeqRef.current === seq) {
        setIsProcessing(false);
        setForgeIconGlow(false);
      }
    }
  }, [setMessages, playSpeech, workflowContext, addMessage, updateLastMessage, currentUser, interactionStyle, addTask, crmContext, onNavigate, isArchitectMode, startTutorial, setForgeIconGlow, activePersona]);

  return { isProcessing, processStreamingCommand, cancelActiveGeneration };
};