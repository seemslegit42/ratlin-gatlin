/**
 * @file App.tsx
 * @description The root application component for the ΛΞVON OS.
 * Implements the Unified Workspace, merging Live and Architect modes via the "Veil-Peel" protocol.
 * Now includes the Rites of Ascension Layer.
 */

import React, { useState, Suspense, lazy, useCallback, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Types
import { Theme, AnimationLevel, type View, type Settings, type WeaverMode, MessageSource, type DesktopWidget, AgentType, AgentTemplate, type ChatMessage, type KlepsydraMetric } from './types.js';

// Contexts
import { useAuth } from './contexts/AuthContext.js';
import { useWorkflowState } from './hooks/useWorkflowState.js';
import { useOperationsState } from './hooks/useOperationsState.js';
import { useCRMState } from './hooks/useCRMState.js';
import { useProcurementState } from './hooks/useProcurementState.js';
import { useCodexState } from './hooks/useCodexState.js';

// Hooks
import { useStreamingChat } from './hooks/useStreamingChat.js';
import { useVoiceLink } from './hooks/useVoiceLink.js';
import { useTextToSpeech } from './hooks/useTextToSpeech.js';
import { useGossip } from './hooks/useGossip.js'; 
import { useEconomy } from './hooks/useEconomy.js'; 
import { useTaskNotifier } from './hooks/useTaskNotifier.js';
import { useWorkflowExecutor } from './hooks/useWorkflowExecutor.js';
import { useTutorial } from './hooks/useTutorial.js';
import { useChaosEconomy } from './hooks/useChaosEconomy.js';
import { useKlepsydra } from './hooks/useKlepsydra.js';
import { useRites } from './hooks/useRites.js'; // RITES HOOK

// Components
import Header from './components/Header.js';
import { SettingsPanel } from './components/SettingsPanel.js';
import { DiegeticOverlay } from './components/ambient/DiegeticOverlay.js';
import Background from './components/ambient/Background.js';
import ActionBar from './components/ActionBar.js';
import CommandStream from './components/CommandStream.js';
import AiChatDock from './components/AiChatDock.js';
import LiveTicker from './components/LiveTicker.js';
import DraggableWidget from './components/dashboard/DraggableWidget.js';
import CommandCenter from './components/shared/CommandCenter.js'; 
import CommandCenterTrigger from './components/shared/CommandCenterTrigger.js';
import SystemFooter from './components/shared/SystemFooter.js';
import PerilousLegalStrip from './components/shared/PerilousLegalStrip.js';
import WorkflowProgressBar from './components/WorkflowProgressBar.js';
import AvatarStack from './components/AvatarStack.js'; 
import GlobalMobileNav from './components/GlobalMobileNav.js'; 
import AgentCreationModal from './components/weaver/AgentCreationModal.js';
import CommandPalette, { type Command } from './components/CommandPalette.js';
import { DemiurgeConsole } from './components/admin/DemiurgeConsole.js';
import { ChaosLayer } from './components/chaos/ChaosLayer.js';

// Rites Components
import { PulsingSigil } from './components/rites/PulsingSigil.js';
import { VisageOfJudgmentModal } from './components/rites/VisageOfJudgmentModal.js';
import { BurnoutFuneral } from './components/rites/BurnoutFuneral.js';

// Icons
import { BrainIcon } from './components/icons/BrainIcon.js';
import { LayersIcon } from './components/icons/LayersIcon.js';
import { PlayIcon, UserGroupIcon } from './components/icons/CommandPaletteIcons.js';
import { CoinsIcon, ChartBarIcon } from './components/icons/EconomyIcons.js';
import { UsersIcon, FolderIcon } from './components/icons/QuickActionIcons.js';
import { ListTodoIcon } from './components/icons/ListTodoIcon.js';
import { ShieldIcon } from './components/icons/SecurityIcons.js';
import { MegaphoneIcon } from './components/icons/MarketingIcons.js';
import { CrownIcon } from './components/icons/CrownIcon.js';
import { BookIcon } from './components/icons/BookIcon.js';
import { SimulationIcon } from './components/icons/SimulationIcon.js';
import { DatabaseIcon } from './components/icons/AetheriumIcons.js';
import { ZapIcon } from './components/icons/VitalsIcons.js'; // For manual trigger

// Widget Content
import SwarmIntegrity from './components/vitalshud/SwarmIntegrity.js';
import FinancialPulse from './components/vitalshud/FinancialPulse.js';
import SystemResources from './components/vitalshud/SystemResources.js';
import { DesktopWidgetType } from './types.js';
import SyndicateOverview from './components/dashboard/SyndicateOverview.js';
import Chronicle from './components/Chronicle.js';
import AmbientController from './components/ambient/AmbientController.js';
import ArmorySheet from './components/shared/ArmorySheet.js';
import TenantLogin from './components/TenantLogin.js';
import PageTransition from './components/shared/PageTransition.js';

// Auth
import Login from './modules/auth/Login.js';
import { EmailVerification } from './modules/auth/EmailVerification.js';
import { RouteGuardLoading } from './components/auth/RouteGuard.js';
import { useNotifications } from './contexts/NotificationContext.js';
import { nanoid } from 'nanoid';
import { SYSTEM_TEMPLATES } from './services/templateService.js';
import { initializeLLMBackend, getLLMBackendStatus } from './services/ollamaService.js';
import { logInteraction, logSystemEvent, logError } from './services/appLogger.js';
import { getPrimaryChatModelId } from './services/llmDefaults.js';
import { useFileManagement } from './hooks/useFileManagement.js';

// --- Lazy Modules ---
const MainView = lazy(() => import('./modules/main/MainView.js'));
const Weaver = lazy(() => import('./modules/weaver/Weaver.js'));
const SimulacrumView = lazy(() => import('./modules/simulacrum/SimulacrumView.js'));
const MicroAppForgeView = lazy(() => import('./components/MicroAppForgeView.js'));
const XiDashboard = lazy(() => import('./modules/economy/XiDashboard.js'));
const AVFView = lazy(() => import('./modules/avf/AVFView.js'));
const CRMView = lazy(() => import('./modules/crm/CRMView.js'));
const OperationsView = lazy(() => import('./modules/operations/OperationsView.js'));
const SecurityView = lazy(() => import('./modules/security/SecurityView.js'));
const AdminView = lazy(() => import('./modules/admin/AdminView.js'));
const NotepadView = lazy(() => import('./modules/notepad/NotepadView.js')); 
const FinanceView = lazy(() => import('./modules/finance/FinanceView.js'));
const ProcurementView = lazy(() => import('./modules/procurement/ProcurementView.js'));
const PantheonView = lazy(() => import('./modules/pantheon/PantheonView.js')); 
const VaultView = lazy(() => import('./modules/vault/VaultView.js')); 
const RegistryView = lazy(() => import('./modules/registry/RegistryView.js')); 
const MarketingView = lazy(() => import('./modules/marketing/MarketingView.js'));
const HRMView = lazy(() => import('./modules/hrm/HRMView.js'));
const ProductionView = lazy(() => import('./modules/production/ProductionView.js'));
const HelpView = lazy(() => import('./modules/help/HelpView.js'));

const LoadingSpinner: React.FC = () => (
  <div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian-black/90 backdrop-blur-xl"
    role="status"
    aria-live="polite"
    aria-label="Loading — syncing neural lattice"
  >
    <div className="w-16 h-16 border-4 border-imperial-purple/20 border-t-imperial-purple rounded-full animate-spin" aria-hidden="true" />
    <div className="mt-4 text-xs font-mono text-roman-aqua tracking-[0.3em] animate-pulse uppercase" aria-hidden="true">Syncing Neural Lattice</div>
  </div>
);

/** Contextual BEEP suggestion chips — shown per active view (spec §2.3 Contextual Action). */
const VIEW_SUGGESTIONS: Partial<Record<View, string[]>> = {
  main:       ['Morning briefing', 'Run the swarm', 'Show cash flow', 'Task status'],
  weaver:     ['Create onboarding workflow', 'Scaffold email sequence', 'Debug last run', 'Show node errors'],
  crm:        ['Show pipeline summary', 'Top open deals', 'Log a call', 'Score leads'],
  operations: ['Overdue tasks', 'Assign to agent', 'Create task', 'Team workload'],
  finance:    ['30-day cash flow', 'Outstanding invoices', 'Revenue vs target', 'Expense breakdown'],
  marketing:  ['Campaign performance', 'Draft email sequence', 'Segment contacts', 'Engagement report'],
  hrm:        ['Team roster', 'Agent workforce status', 'Open roles', 'Performance review'],
  simulacrum: ['Swarm diagnostic', 'Nudge idle agents', 'Broadcast message', 'Show error agents'],
  security:   ['Threat scan', 'Show anomalies', 'Security status', 'Compliance report'],
  economy:    ['Xi balance', 'Treasury report', 'Pact tier status', 'Chaos deck'],
  production: ['Supply chain status', 'Inventory levels', 'Demand forecast', 'Factory metrics'],
  procurement: ['Open orders', 'Supplier risk', 'Pending approvals', 'Cost analysis'],
};

const App: React.FC = () => {
  const { currentUser, syndicateId, updateUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  const validSyndicateId = syndicateId || '';
  useFileManagement({ syndicateId: validSyndicateId || null, active: !!currentUser });
  const workflowState = useWorkflowState(validSyndicateId, currentUser?.id);
  const operationsState = useOperationsState(validSyndicateId, currentUser?.id);
  const crmState = useCRMState(validSyndicateId, currentUser?.name, currentUser?.id);
  const procurementState = useProcurementState(validSyndicateId, currentUser?.id);
  const codexState = useCodexState(validSyndicateId, currentUser?.id);

  const { metrics: klepsydra } = useKlepsydra(addNotification, workflowState.agents, workflowState.updateAgent, currentUser, updateUser);
  const { economyData } = useEconomy();
  const { gossipLog, activeTethers, currentBubbles } = useGossip(workflowState.agents, !!currentUser);
  
  // RITES ENGINE
  const { pillar, activeRite, follyTriggered, triggerFollyInterdiction, handleAcknowledgeFolly, handleBeginFuneral, handleCompleteFuneral } = useRites();
  
  const { isActive: isTutorialActive, currentStep: tutorialStep, nextStep: nextTutorialStep, dismissTutorial, startTutorial, totalSteps } = useTutorial(currentUser);

  // Chaos Engine
  const handleXiUpdate = (amount: number) => {
    if (currentUser) updateUser({ xiBalance: currentUser.xiBalance + amount });
  };
  const { activeEffects } = useChaosEconomy(currentUser, handleXiUpdate);

  const [mode, setMode] = useState<WeaverMode>('live');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalCreatorOpen, setIsGlobalCreatorOpen] = useState(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [isDemiurgeOpen, setIsDemiurgeOpen] = useState(false); 
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  /** Pre-fill the BEEP ActionBar input via KPI ticker touch-to-fill (spec §2.1). */
  const [beepPrefill, setBeepPrefill] = useState<string | undefined>(undefined);

  const [settings, setSettings] = useState<Settings>({
    theme: Theme.Dark, animationLevel: AnimationLevel.Full, interactionStyle: 'concise',
    anomalySensitivity: 50, llmProvider: 'ollama', mcpAutoAbsorption: false
  });

  const handleUpdateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const [activeWidgets, setActiveWidgets] = useState<DesktopWidget[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { playSpeech, isSpeaking } = useTextToSpeech(isTtsMuted);
  
  const handleNavigate = useCallback((target: View) => {
    logInteraction('navigate.view_change', { view: target });
    if (target === 'main') { setMode('live'); navigate('/'); }
    else if (target === 'weaver') { setMode('architect'); navigate('/'); }
    else navigate(`/${target}`);
  }, [navigate]);

  const currentView = useMemo(() => {
    const p = location.pathname.substring(1);
    if (!p) return mode === 'live' ? 'main' : 'weaver';
    return p as View;
  }, [location.pathname, mode]);

  const { runAllAgents } = useWorkflowExecutor(
    workflowState.agents, workflowState.connections, workflowState.crews, 
    workflowState.updateAgent, workflowState.logEvent, addNotification, 
    workflowState.takeSnapshot, workflowState.setIsWorkflowExecuting, 
    validSyndicateId, setMessages, operationsState.addTask
  );

  const handleGlobalAddAgent = async (type: AgentType, template?: AgentTemplate) => {
      await workflowState.addAgent(type, template);
      setIsGlobalCreatorOpen(false);
      setMode('architect');
      navigate('/');
      addNotification(`${type} entity manifested.`, 'success');
  };
  
  // Rite Action Handlers
  const confirmFolly = () => {
      handleAcknowledgeFolly(15).then((res) => {
          if (res?.unlockedBurnout) {
              addNotification("Burnout Protocol Unlocked. Visit the Demiurge to initiate.", "success");
          }
      });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setIsCommandPaletteOpen(v => !v); }
      if (e.key === 'Escape') { 
        setIsCommandPaletteOpen(false); 
        setIsCommandCenterOpen(false); 
        setIsSettingsOpen(false); 
        setIsDemiurgeOpen(false); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    logSystemEvent('session.authenticated_mount', {});
  }, [currentUser]);

  // Initialize LLM Backend (MediaPipe or Ollama)
  useEffect(() => {
    const initLLM = async () => {
      try {
        logSystemEvent('llm.bootstrap_start', {});
        await initializeLLMBackend();
        const status = getLLMBackendStatus();
        const beepModel = getPrimaryChatModelId();
        logSystemEvent('llm.bootstrap_ok', {
          backend: status.backend,
          ready: status.ready,
          chatModelHint: beepModel,
        });
        if (status.backend === 'litellm') {
          addNotification(`LiteLLM ready — Granite + Gemma${status.cloudFallback ? ' + OpenRouter cloud' : ''}.`, 'success');
        } else if (status.backend === 'openrouter') {
          addNotification('OpenRouter cloud API ready.', 'success');
        } else if (status.backend === 'mediapipe') {
          addNotification('Local AI engine initialized via WebGPU.', 'success');
        } else {
          addNotification(`BEEP linked to ${beepModel} (Ollama).`, 'success');
        }
      } catch (error) {
        logError('llm.bootstrap_failed', error, {});
        addNotification('LLM initialization warning. Falling back to default settings.', 'info');
      }
    };

    if (currentUser) {
      initLLM();
    }
  }, [currentUser, addNotification]);

  const commands: Command[] = useMemo(() => {
    const cmds: Command[] = [
        { id: 'nav-main', name: 'Open Cockpit', category: 'Navigation', icon: <BrainIcon className="w-4 h-4" />, action: () => handleNavigate('main') },
        { id: 'nav-weaver', name: 'Weaver Studio', category: 'Navigation', icon: <LayersIcon className="w-4 h-4" />, action: () => handleNavigate('weaver') },
        { id: 'nav-help', name: 'Help Center', category: 'Navigation', icon: <BookIcon className="w-4 h-4" />, action: () => handleNavigate('help') },
        { id: 'nav-avf', name: 'Open AVF Command Deck', category: 'Navigation', icon: <ChartBarIcon className="w-4 h-4" />, action: () => handleNavigate('avf') },
        { id: 'open-armory', name: 'Open Armory Protocol', category: 'Archetypes', icon: <CrownIcon className="w-4 h-4" />, action: () => setIsArmoryOpen(true) },
        // ... (existing commands)
        { id: 'run-swarm', name: 'Execute Swarm', category: 'Operations', icon: <PlayIcon className="w-4 h-4" />, action: () => void runAllAgents() },
        { id: 'sim-folly', name: 'Simulate Folly Detection', category: 'Debug', icon: <ZapIcon className="w-4 h-4" />, action: () => triggerFollyInterdiction() },
    ];
    
    // Add Burnout Command if unlocked
    if (pillar?.unlockedRites.includes('BURNOUT_FUNERAL')) {
        cmds.push({
            id: 'rite-burnout', name: 'Initiate Burnout Funeral', category: 'Rites', 
            icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>, 
            action: () => handleBeginFuneral()
        });
    }
    return cmds;
  }, [handleNavigate, runAllAgents, triggerFollyInterdiction, pillar, handleBeginFuneral]);

  const { isProcessing, processStreamingCommand, cancelActiveGeneration } = useStreamingChat(
    setMessages, playSpeech, workflowState, () => {}, currentUser, settings.interactionStyle,
    operationsState.addTask, 
    { 
      ...crmState, 
      deals: Object.values(crmState.pipeline).flat() 
    }, 
    procurementState, codexState, 
    (v) => handleNavigate(v), 
    startTutorial,
    handleUpdateSettings
  );

  const handleVoiceBeepCommand = useCallback(
    (command: string) => {
      const cmd = command.trim();
      if (!cmd || !currentUser) return;
      void processStreamingCommand(cmd, currentView);
    },
    [currentUser, processStreamingCommand, currentView],
  );

  const { isLive, volume, startLiveSession, stopLiveSession } = useVoiceLink(
    setMessages,
    currentUser,
    addNotification,
    handleVoiceBeepCommand,
  );

  const handleSpawnWidget = (type: DesktopWidgetType) => {
    setActiveWidgets(prev => [...prev, {
        id: nanoid(), type, title: type.toString().replace(/([A-Z])/g, ' $1').trim(), position: { x: 100 + (prev.length * 20), y: 100 + (prev.length * 20) }, zIndex: 50 + prev.length 
    }]);
  };

  if (isLoading) {
    return <RouteGuardLoading />;
  }

  if (!currentUser) return (
    <Routes>
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/tenant-login" element={<TenantLogin />} />
        <Route path="*" element={<Login />} />
    </Routes>
  );

  return (
    <div className={`app-shell h-screen w-screen overflow-hidden text-text-primary font-lexend high-density ${settings.theme === 'light' ? 'bg-white' : 'bg-obsidian-black'}`}>
      <Background />
      <DiegeticOverlay />
      <AmbientController />
      <ChaosLayer effects={activeEffects} />
      
      {/* --- RITES LAYER --- */}
      <AnimatePresence>
          {follyTriggered && (
              <>
                <PulsingSigil onClick={() => {}} />
                <VisageOfJudgmentModal onAcknowledge={confirmFolly} follyDuration={15} />
              </>
          )}
          {activeRite === 'BURNOUT_FUNERAL' && (
              <BurnoutFuneral onComplete={handleCompleteFuneral} />
          )}
      </AnimatePresence>

      {/* Header — Executive Telemetry Header with KPI ticker (spec §2.1) */}
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        currentUser={currentUser} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        mode={mode}
        setMode={setMode}
        onSummonDemiurge={() => setIsDemiurgeOpen(true)}
        onLogout={logout}
        onQuickCommand={(cmd) => {
          setBeepPrefill(cmd);
          void processStreamingCommand(cmd, currentView);
        }}
        agents={workflowState.agents}
        economyData={economyData}
        klepsydra={klepsydra}
        users={workflowState.users}
      />

      {/* Mobile bottom padding: nav (5rem) + safe-area + dock peek composer (~4.5rem) */}
      <main id="main-content" className="h-full w-full pt-16 relative max-md:pb-[calc(5rem+env(safe-area-inset-bottom,0px)+4.5rem)] md:pb-0 high-density">
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                      <motion.div 
                        key={mode}
                        initial={{ opacity: 0, scale: mode === 'architect' ? 0.98 : 1.01, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: mode === 'architect' ? 1.01 : 0.98, filter: 'blur(4px)' }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full h-full"
                      >
                        {mode === 'live' ? (
                            <MainView 
                              agents={workflowState.agents} 
                              currentUser={currentUser} 
                              onNavigate={handleNavigate} 
                              klepsydra={klepsydra}
                              economyData={economyData}
                              pipeline={crmState.pipeline}
                              crmActivities={crmState.activities}
                              messages={messages}
                              isProcessing={isProcessing}
                              isLive={isLive}
                              isSpeaking={isSpeaking}
                              volume={volume}
                              isTtsMuted={isTtsMuted}
                              onToggleTtsMute={() => setIsTtsMuted((prev) => !prev)}
                              onSendCommand={(cmd, attach) => {
                                setBeepPrefill(undefined);
                                void processStreamingCommand(cmd, currentView, attach);
                              }}
                              onToggleLive={isLive ? stopLiveSession : startLiveSession}
                              onOpenAgentCreator={() => setIsGlobalCreatorOpen(true)}
                              onSpawnWidget={handleSpawnWidget}
                              onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
                              onStopGeneration={cancelActiveGeneration}
                              beepPrefill={beepPrefill}
                            />
                        ) : (
                            <Weaver 
                              {...workflowState}
                              currentUser={currentUser}
                              onNavigate={handleNavigate}
                              mode={mode}
                              setMode={setMode}
                              syndicateId={validSyndicateId}
                              addTask={operationsState.addTask}
                              klepsydra={klepsydra}
                              economyData={economyData}
                              tutorial={{
                                  isActive: isTutorialActive,
                                  currentStep: tutorialStep,
                                  onNext: nextTutorialStep,
                                  onDismiss: dismissTutorial,
                                  stepIndex: 0, 
                                  totalSteps: totalSteps
                              }}
                              saveVersion={workflowState.saveVersion}
                              restoreVersion={workflowState.restoreVersion}
                              deleteVersion={workflowState.deleteVersion}
                              saveTemplate={workflowState.saveTemplate}
                              synthesizeAgentAvatar={workflowState.synthesizeAgentAvatar}
                            />
                        )}
                      </motion.div>
                  } />
                  
                  <Route path="/simulacrum" element={
                      <SimulacrumView 
                          agents={workflowState.agents} 
                          onNavigate={handleNavigate} 
                          gossipLog={gossipLog} 
                          activeTethers={activeTethers} 
                          currentBubbles={currentBubbles} 
                          updateAgent={workflowState.updateAgent} 
                      />
                  } />
                  <Route path="/vault" element={<PageTransition><VaultView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/registry" element={<PageTransition><RegistryView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/microAppForge" element={<PageTransition><MicroAppForgeView onNavigate={handleNavigate} currentUser={currentUser} /></PageTransition>} />
                  <Route path="/economy" element={<PageTransition><XiDashboard onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/avf" element={<PageTransition><AVFView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/finance" element={<PageTransition><FinanceView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/crm" element={<PageTransition><CRMView onNavigate={handleNavigate} {...crmState} /></PageTransition>} />
                  <Route path="/operations" element={
                      <PageTransition>
                        <OperationsView
                            onNavigate={handleNavigate}
                            tasks={operationsState.tasks}
                            onUpdateTask={operationsState.updateTask}
                            onDeleteTask={operationsState.deleteTask}
                            agents={workflowState.agents}
                        />
                      </PageTransition>
                  } />
                  <Route path="/procurement" element={<PageTransition><ProcurementView onNavigate={handleNavigate} {...procurementState} /></PageTransition>} />
                  <Route path="/security" element={<PageTransition><SecurityView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/admin" element={<PageTransition><AdminView onNavigate={handleNavigate} agents={workflowState.agents} connections={workflowState.connections} /></PageTransition>} />
                  <Route path="/codex" element={<PageTransition><NotepadView onNavigate={handleNavigate} {...codexState} /></PageTransition>} />
                  <Route path="/pantheon" element={<PageTransition><PantheonView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route
                    path="/marketing"
                    element={
                      <PageTransition>
                        <MarketingView
                          onNavigate={handleNavigate}
                          contacts={crmState.contacts}
                          activities={crmState.activities}
                          currentUserId={currentUser?.id}
                        />
                      </PageTransition>
                    }
                  />
                  <Route path="/hrm" element={<PageTransition><HRMView onNavigate={handleNavigate} agents={workflowState.agents} /></PageTransition>} />
                  <Route path="/production" element={<PageTransition><ProductionView onNavigate={handleNavigate} /></PageTransition>} />
                  <Route path="/help" element={<PageTransition><HelpView onNavigate={handleNavigate} /></PageTransition>} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
          
           {/* Desktop Widgets Layer */}
           {activeWidgets.map(widget => (
               <DraggableWidget 
                   key={widget.id} 
                   id={widget.id} 
                   title={widget.title} 
                   position={widget.position} 
                   zIndex={widget.zIndex} 
                   onDragEnd={(id, x, y) => setActiveWidgets(prev => prev.map(w => w.id === id ? { ...w, position: { x, y } } : w))} 
                   onFocus={(id) => setActiveWidgets(prev => prev.map(w => w.id === id ? { ...w, zIndex: Math.max(...prev.map(p => p.zIndex)) + 1 } : w))} 
                   onClose={(id) => setActiveWidgets(prev => prev.filter(w => w.id !== id))}
               >
                   {widget.type === DesktopWidgetType.SwarmIntegrity && <SwarmIntegrity agents={workflowState.agents} onNavigate={handleNavigate} />}
                   {widget.type === DesktopWidgetType.FinancialPulse && <FinancialPulse data={economyData} onNavigate={() => handleNavigate('economy')} />}
                   {widget.type === DesktopWidgetType.SystemResources && <SystemResources agents={workflowState.agents} />}
                   {widget.type === DesktopWidgetType.SyndicateOverview && <SyndicateOverview onNavigate={handleNavigate} />}
                   {widget.type === DesktopWidgetType.Chronicle && <Chronicle events={workflowState.chronicle || []} isMobile={false} dragConstraintsRef={{ current: document.body as unknown as HTMLDivElement }} />}
               </DraggableWidget>
           ))}
      </main>

      {/* --- BEEP unified console (global) --- */}
      <AiChatDock
        transcript={
          <CommandStream
            messages={messages}
            onWidgetInteraction={(cmd) => processStreamingCommand(cmd, currentView)}
            onNavigate={handleNavigate}
          />
        }
        composer={
          <ActionBar
            isProcessing={isProcessing}
            isLive={isLive}
            isSpeaking={isSpeaking}
            volume={volume}
            isTtsMuted={isTtsMuted}
            onToggleTtsMute={() => setIsTtsMuted((prev) => !prev)}
            onSendCommand={(cmd, attach) => {
              setBeepPrefill(undefined);
              processStreamingCommand(cmd, currentView, attach);
            }}
            onToggleLive={isLive ? stopLiveSession : startLiveSession}
            onNavigate={handleNavigate}
            onOpenAgentCreator={() => setIsGlobalCreatorOpen(true)}
            onSpawnWidget={handleSpawnWidget}
            onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
            onStopGeneration={cancelActiveGeneration}
            prefillInput={beepPrefill}
            suggestions={VIEW_SUGGESTIONS[currentView] ?? VIEW_SUGGESTIONS.main}
          />
        }
        onClearTranscript={() => setMessages([])}
        isProcessing={isProcessing}
        messageCount={messages.length}
        lastMessagePreview={messages.length > 0 ? messages[messages.length - 1].text : undefined}
        lastMessageSource={messages.length > 0 ? (messages[messages.length - 1].source as 'BEEP' | 'USER' | 'SYSTEM' | 'AEGIS') : undefined}
      />

      {/* LiveTicker — KPI metrics tappable for touch-to-fill (spec §2.1) */}
      <LiveTicker
        agents={workflowState.agents}
        economy={economyData}
        klepsydra={klepsydra}
        onMetricTap={(prompt) => {
          setBeepPrefill(prompt);
          // Open dock to half so user sees the pre-filled input
          const el = document.getElementById('beep-chat-input') as HTMLTextAreaElement | null;
          if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
        }}
      />

      <GlobalMobileNav 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          onOpenCommandCenter={() => setIsCommandCenterOpen(true)} 
          commandCenterOpen={isCommandCenterOpen}
      />

      <AnimatePresence>
        {workflowState.isWorkflowExecuting && <WorkflowProgressBar />}
      </AnimatePresence>

      <SystemFooter />
      <PerilousLegalStrip />

      <div className="fixed bottom-24 right-6 z-40 hidden md:block">
          <CommandCenterTrigger isOpen={isCommandCenterOpen} onClick={() => setIsCommandCenterOpen(true)} />
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel 
              settings={settings} 
              onUpdateSettings={(updates) => setSettings(prev => ({ ...prev, ...updates }))} 
              onResetWorkspace={workflowState.resetWorkspace}
              onResetAllAgents={workflowState.resetAllAgents}
              onClose={() => setIsSettingsOpen(false)}
              dragConstraintsRef={{ current: document.body as unknown as HTMLDivElement }}
          />
        )}
      </AnimatePresence>
      
      <CommandCenter 
          isOpen={isCommandCenterOpen} 
          onClose={() => setIsCommandCenterOpen(false)} 
          onNavigate={handleNavigate} 
          onQuickAction={(cmd) => processStreamingCommand(cmd, currentView)}
          onSpawnWidget={handleSpawnWidget}
      />
      
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />

      <AgentCreationModal 
          isOpen={isGlobalCreatorOpen} 
          onClose={() => setIsGlobalCreatorOpen(false)} 
          onAddAgent={handleGlobalAddAgent} 
          templates={SYSTEM_TEMPLATES}
      />

      <ArmorySheet 
          isOpen={isArmoryOpen} 
          onClose={() => setIsArmoryOpen(false)} 
          onSelectAgent={(type) => {
            handleGlobalAddAgent(type);
            setIsArmoryOpen(false);
          }} 
      />
      
      <AnimatePresence>
        {isDemiurgeOpen && <DemiurgeConsole isOpen={isDemiurgeOpen} onClose={() => setIsDemiurgeOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
