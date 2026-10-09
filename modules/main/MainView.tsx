/**
 * @file modules/main/MainView.tsx
 * @description The Sovereign Cockpit.
 * The primary dashboard for the user, displaying high-level system status,
 * active directives, Oracle Axiom, activity feed, quick actions, and real-time telemetry.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, View, CurrentUser, KlepsydraMetric, CRMDeal, CRMActivity, ChatMessage, DesktopWidgetType } from '../../types.js';
import { generateStrategicAxiom } from '../../services/ollamaService.js';
import VitalsHUD from '../../components/VitalsHUD.js';
import { GlassPane } from '../../components/shared/GlassPane.js';
import { BrainIcon } from '../../components/icons/BrainIcon.js';
import type { XiFlowData } from '../../services/xiEconomyService.js';
import { CoinsIcon } from '../../components/icons/EconomyIcons.js';
import { ZapIcon, TrendingUpIcon } from '../../components/icons/VitalsIcons.js';
import { CrownIcon } from '../../components/icons/CrownIcon.js';
import { LayersIcon } from '../../components/icons/LayersIcon.js';
import { ShieldIcon } from '../../components/icons/SecurityIcons.js';
import { ListTodoIcon } from '../../components/icons/ListTodoIcon.js';
import { MegaphoneIcon } from '../../components/icons/MarketingIcons.js';
import { DatabaseIcon } from '../../components/icons/AetheriumIcons.js';
import { UsersIcon } from '../../components/icons/QuickActionIcons.js';

import { CHudVitals } from '../../components/CHudVitals.js';
import CommandStream from '../../components/CommandStream.js';
import ActionBar from '../../components/ActionBar.js';
import { useBreakpoint } from '../../hooks/useBreakpoint.js';

interface MainViewProps {
    agents?: Record<string, Agent>;
    currentUser?: CurrentUser;
    onNavigate: (view: View) => void;
    klepsydra?: KlepsydraMetric;
    economyData?: XiFlowData | null;
    pipeline?: Record<string, CRMDeal[]>;
    crmActivities?: CRMActivity[];
    messages?: ChatMessage[];
    isProcessing?: boolean;
    isLive?: boolean;
    isSpeaking?: boolean;
    volume?: number;
    isTtsMuted?: boolean;
    onToggleTtsMute?: () => void;
    onSendCommand?: (cmd: string, attach?: any) => void;
    onToggleLive?: () => void;
    onOpenAgentCreator?: () => void;
    onSpawnWidget?: (type: DesktopWidgetType) => void;
    onOpenCommandCenter?: () => void;
    onStopGeneration?: () => void;
    beepPrefill?: string;
}

const MainView: React.FC<MainViewProps> = ({
    agents = {}, currentUser, onNavigate, klepsydra, economyData,
    pipeline, crmActivities,
    messages = [], isProcessing = false, isLive = false, isSpeaking = false, volume = 0, isTtsMuted = false,
    onToggleTtsMute = () => {}, onSendCommand = () => {}, onToggleLive = () => {}, onOpenAgentCreator = () => {},
    onSpawnWidget = () => {}, onOpenCommandCenter = () => {}, onStopGeneration = () => {}, beepPrefill
}) => {
    const isMobile = useBreakpoint();
    const [hudMode, setHudMode] = useState<'compressed' | 'expanded'>('compressed');

    // Derived values for CHudVitals
    const activeAgents = Object.values(agents || {}).filter(a => a?.status !== 'Idle').length;
    const totalAgents = Object.keys(agents || {}).length;
    const profitVelocity = klepsydra?.flowScore ?? 0;
    const marketDisruption = 68;
    const projectStatus = "Project Genesis";
    const projectProgress = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 45;

    return (
        <div className="h-full w-full relative bg-obsidian-black flex flex-col font-lexend overflow-hidden high-density">
            {/* C-HUD Layout Protocol */}
            
            {/* Top 1/3: Vitals HUD Container with Mode Toggle */}
            <div className={`${hudMode === 'expanded' ? 'min-h-[220px]' : 'h-[30%] min-h-[160px]'} flex-shrink-0 z-40 relative group`}>
                <button
                    onClick={() => setHudMode(prev => prev === 'compressed' ? 'expanded' : 'compressed')}
                    className="absolute top-2 right-4 z-50 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                    title="Toggle HUD Telemetry View"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-roman-aqua animate-pulse" />
                    <span>{hudMode === 'compressed' ? 'EXPAND PODS' : 'COMPRESS HUD'}</span>
                </button>
                {hudMode === 'compressed' ? (
                    <CHudVitals 
                        profitVelocity={profitVelocity}
                        marketDisruption={marketDisruption}
                        projectStatus={projectStatus}
                        projectProgress={projectProgress}
                    />
                ) : (
                    <div className="h-full overflow-x-auto p-2 bg-black/40 border-b border-glass-border">
                        <VitalsHUD 
                            agents={agents} 
                            onNavigate={onNavigate} 
                            klepsydra={klepsydra || { flowScore: profitVelocity, flowState: 'Balanced', latencyMs: 24 } as any} 
                            economyData={economyData} 
                        />
                    </div>
                )}
            </div>

            {/* Bottom 2/3: Command Stream (Chat) */}
            <div className="flex-grow overflow-hidden flex flex-col relative">
                {/* Background ambient effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(106,13,173,0.05),transparent_70%)] pointer-events-none" />
                
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:px-8 pb-32">
                    <div className="max-w-4xl mx-auto w-full">
                        <CommandStream 
                            messages={messages}
                            onWidgetInteraction={onSendCommand}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>

                {/* The expanded Dock (ActionBar) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-obsidian-black via-obsidian-black/90 to-transparent z-50">
                    <div className="max-w-3xl mx-auto w-full">
                        <ActionBar 
                            isProcessing={isProcessing}
                            isLive={isLive}
                            isSpeaking={isSpeaking}
                            volume={volume}
                            isTtsMuted={isTtsMuted}
                            onToggleTtsMute={onToggleTtsMute}
                            onSendCommand={onSendCommand}
                            onToggleLive={onToggleLive}
                            onNavigate={onNavigate}
                            onOpenAgentCreator={onOpenAgentCreator}
                            onSpawnWidget={onSpawnWidget}
                            onOpenCommandCenter={onOpenCommandCenter}
                            onStopGeneration={onStopGeneration}
                            prefillInput={beepPrefill}
                            suggestions={['Morning briefing', 'Run the swarm', 'Show cash flow', 'Task status']}
                        />
                    </div>
                </div>
            </div>

            {/* Ambient FX Layer */}
            <div className="fixed inset-0 pointer-events-none z-[200] opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};


export default MainView;
