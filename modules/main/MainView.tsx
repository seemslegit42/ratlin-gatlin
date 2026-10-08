/**
 * @file modules/main/MainView.tsx
 * @description The Sovereign Cockpit.
 * The primary dashboard for the user, displaying high-level system status,
 * active directives, Oracle Axiom, activity feed, quick actions, and real-time telemetry.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, View, CurrentUser, KlepsydraMetric, CRMDeal, CRMActivity } from '../../types';
import { generateStrategicAxiom } from '../../services/ollamaService';
import VitalsHUD from '../../components/VitalsHUD';
import { GlassPane } from '../../components/shared/GlassPane';
import { BrainIcon } from '../../components/icons/BrainIcon';
import type { XiFlowData } from '../../services/xiEconomyService';
import { CoinsIcon } from '../../components/icons/EconomyIcons';
import { ZapIcon, TrendingUpIcon } from '../../components/icons/VitalsIcons';
import { CrownIcon } from '../../components/icons/CrownIcon';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { ShieldIcon } from '../../components/icons/SecurityIcons';
import { ListTodoIcon } from '../../components/icons/ListTodoIcon';
import { MegaphoneIcon } from '../../components/icons/MarketingIcons';
import { DatabaseIcon } from '../../components/icons/AetheriumIcons';
import { UsersIcon } from '../../components/icons/QuickActionIcons';

import { CHudVitals } from '../../components/CHudVitals';
import CommandStream from '../../components/CommandStream';
import ActionBar from '../../components/ActionBar';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface MainViewProps {
    agents: Record<string, Agent>;
    currentUser: CurrentUser;
    onNavigate: (view: View) => void;
    klepsydra: KlepsydraMetric;
    economyData: XiFlowData | null;
    messages: ChatMessage[];
    isProcessing: boolean;
    isLive: boolean;
    isSpeaking: boolean;
    volume: number;
    isTtsMuted: boolean;
    onToggleTtsMute: () => void;
    onSendCommand: (cmd: string, attach?: any) => void;
    onToggleLive: () => void;
    onOpenAgentCreator: () => void;
    onSpawnWidget: (type: DesktopWidgetType) => void;
    onOpenCommandCenter: () => void;
    onStopGeneration: () => void;
    beepPrefill?: string;
}

const MainView: React.FC<MainViewProps> = ({
    agents, currentUser, onNavigate, klepsydra, economyData,
    messages, isProcessing, isLive, isSpeaking, volume, isTtsMuted,
    onToggleTtsMute, onSendCommand, onToggleLive, onOpenAgentCreator,
    onSpawnWidget, onOpenCommandCenter, onStopGeneration, beepPrefill
}) => {
    const isMobile = useBreakpoint();

    // Derived values for CHudVitals
    const activeAgents = Object.values(agents).filter(a => a.status !== 'Idle').length;
    const totalAgents = Object.keys(agents).length;
    const profitVelocity = klepsydra.flowScore; // Using flowScore as a proxy for profit velocity
    const marketDisruption = 68; // Hardcoded placeholder for now
    const projectStatus = "Project Genesis";
    const projectProgress = activeAgents > 0 ? (activeAgents / totalAgents) * 100 : 45;

    return (
        <div className="h-full w-full relative bg-obsidian-black flex flex-col font-lexend overflow-hidden high-density">
            {/* C-HUD Layout Protocol */}
            
            {/* Top 1/3: Compressed Vitals HUD */}
            <div className="h-[30%] min-h-[160px] flex-shrink-0 z-40">
                <CHudVitals 
                    profitVelocity={profitVelocity}
                    marketDisruption={marketDisruption}
                    projectStatus={projectStatus}
                    projectProgress={projectProgress}
                />
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
