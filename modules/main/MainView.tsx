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
import SassyBeepCompanion from '../../components/beep/SassyBeepCompanion.js';
import BioDigitalVein from '../../components/beep/BioDigitalVein.js';
import BioDigitalFlow from '../../components/beep/BioDigitalFlow.js';
import MarketSenseRadar from '../../components/beep/MarketSenseRadar.js';
import ValueStreamMatrix from '../../components/beep/ValueStreamMatrix.js';
import AntifragilityCrucible from '../../components/beep/AntifragilityCrucible.js';
import { useBeepOS } from '../../hooks/useBeepOS.js';
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph.js';
import { sounds } from '../../utils/soundEffects.js';

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
    onTogglePresence?: () => void;
    beepPrefill?: string;
}

type MainViewTab = 'stream' | 'organism' | 'radar' | 'streams' | 'crucible';

const MainView: React.FC<MainViewProps> = ({
    agents = {}, currentUser, onNavigate, klepsydra, economyData,
    pipeline, crmActivities,
    messages = [], isProcessing = false, isLive = false, isSpeaking = false, volume = 0, isTtsMuted = false,
    onToggleTtsMute = () => {}, onSendCommand = () => {}, onToggleLive = () => {}, onOpenAgentCreator = () => {},
    onSpawnWidget = () => {}, onOpenCommandCenter = () => {}, onStopGeneration = () => {}, onTogglePresence = () => {}, beepPrefill
}) => {
    const isMobile = useBreakpoint();
    const [hudMode, setHudMode] = useState<'compressed' | 'expanded'>('compressed');
    const [activeTab, setActiveTab] = useState<MainViewTab>('stream');
    const [showSassyCompanion, setShowSassyCompanion] = useState<boolean>(true);

    // BEEP Autonomous Operating System Engine
    const {
        streams,
        signals,
        maneuvers,
        chaosHistory,
        isSelfOrganizing,
        totalCapitalManaged,
        avgPhi,
        sassyAxiom,
        godModeUnlocked,
        activeChaosShock,
        chaosCountdown,
        triggerSelfOrganization,
        executeManeuver,
        injectChaosStress,
        triggerEasterEgg,
    } = useBeepOS((msg, type) => {
        if (type === 'success') sounds.playSuccessHarmonic();
        else if (type === 'warning' || type === 'error') sounds.playErrorHum();
        else sounds.playCrystallineChime(1200);
    });

    // Derived values for CHudVitals
    const activeAgents = Object.values(agents || {}).filter(a => a?.status !== 'Idle').length;
    const totalAgents = Object.keys(agents || {}).length;
    const profitVelocity = klepsydra?.flowScore ?? 0;
    const marketDisruption = 68;
    const projectStatus = godModeUnlocked ? "Deity Matrix: Active" : "Project Genesis";
    const projectProgress = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 45;

    const handleTabChange = (tab: MainViewTab) => {
        sounds.playCrystallineChime(1300);
        setActiveTab(tab);
    };

    return (
        <div className="h-full w-full relative bg-obsidian-black flex flex-col font-lexend overflow-hidden high-density">
            {/* Top 1/3: Vitals HUD Container with Mode Toggle and Sub-Tabs */}
            <div className={`${hudMode === 'expanded' ? 'min-h-[220px]' : 'h-[28%] min-h-[160px]'} flex-shrink-0 z-40 relative group border-b border-white/10`}>
                <div className="absolute top-2 right-4 z-50 flex items-center gap-2">
                    <button
                        onClick={onTogglePresence}
                        className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                        title="Toggle Presence Logs"
                    >
                        <span>PRESENCE</span>
                    </button>
                    <button
                        onClick={() => setHudMode(prev => prev === 'compressed' ? 'expanded' : 'compressed')}
                        className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                        title="Toggle HUD Telemetry View"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-roman-aqua animate-pulse" />
                        <span>{hudMode === 'compressed' ? 'EXPAND PODS' : 'COMPRESS HUD'}</span>
                    </button>
                </div>

                {hudMode === 'compressed' ? (
                    <CHudVitals 
                        profitVelocity={profitVelocity}
                        marketDisruption={marketDisruption}
                        projectStatus={projectStatus}
                        projectProgress={projectProgress}
                    />
                ) : (
                    <div className="h-full overflow-x-auto p-2 bg-black/40">
                        <VitalsHUD 
                            agents={agents} 
                            onNavigate={onNavigate} 
                            klepsydra={klepsydra || { flowScore: profitVelocity, flowState: 'Balanced', latencyMs: 24 } as any} 
                            economyData={economyData} 
                        />
                    </div>
                )}
            </div>

            {/* Sub-navigation Strip: Sovereign Cockpit Perspectives */}
            <div className="flex-shrink-0 bg-black/60 px-4 py-2 border-b border-white/5 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar z-30">
                <div className="flex items-center gap-1.5">
                    {[
                        { id: 'stream' as const, label: 'Command Stream', glyph: 'oracle' as const },
                        { id: 'organism' as const, label: 'Bio-Digital Life', glyph: 'conduit' as const },
                        { id: 'radar' as const, label: 'Market Radar', glyph: 'sentinel' as const },
                        { id: 'streams' as const, label: 'Value Streams', glyph: 'lattice' as const },
                        { id: 'crucible' as const, label: 'Antifragility', glyph: 'crucible' as const },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleTabChange(t.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-comfortaa font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
                                activeTab === t.id
                                    ? 'bg-roman-aqua/20 text-roman-aqua border border-roman-aqua/50 shadow-[0_0_12px_rgba(32,178,170,0.25)]'
                                    : 'text-text-tertiary hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <CrystallineGlyph type={t.glyph} size="xs" state={activeTab === t.id ? 'active' : 'dormant'} />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-text-tertiary">
                    <span className="hidden lg:inline text-[10px]">
                        Antifragility: <span className="text-patina-green font-bold">{avgPhi}Φ</span>
                    </span>
                    <button
                        onClick={() => setShowSassyCompanion(v => !v)}
                        className="px-2 py-1 rounded text-[10px] font-mono uppercase bg-white/5 hover:bg-white/10 text-roman-aqua border border-white/10 transition-colors"
                        title="Toggle Sassy BEEP Clippy 2.0"
                    >
                        {showSassyCompanion ? 'Minimize BEEP' : 'Summon BEEP'}
                    </button>
                </div>
            </div>

            {/* Main Content Area based on Selected Mode */}
            <div className="flex-grow overflow-hidden flex flex-col relative">
                {/* Subtle radial ambient light */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(106,13,173,0.06),transparent_70%)] pointer-events-none" />

                <div className="flex-grow overflow-y-auto custom-scrollbar p-3 md:p-6 pb-36">
                    <div className="max-w-5xl mx-auto w-full space-y-4">
                        {/* Interactive Sassy BEEP Fourth-Wall Entity */}
                        {showSassyCompanion && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SassyBeepCompanion
                                    axiom={sassyAxiom}
                                    onQuickRebalance={() => triggerSelfOrganization('GROWTH_SURGE')}
                                    onMarketProbe={() => {
                                        sounds.playCrystallineChime(1200);
                                        setActiveTab('radar');
                                    }}
                                    onChaosTest={() => {
                                        sounds.playCrystallineChime(1000);
                                        setActiveTab('crucible');
                                    }}
                                    onUnlockGodMode={triggerEasterEgg}
                                    isSelfOrganizing={isSelfOrganizing}
                                    godModeActive={godModeUnlocked}
                                />
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* Perspective 1: The Command Stream */}
                            {activeTab === 'stream' && (
                                <motion.div
                                    key="tab-stream"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <CommandStream 
                                        messages={messages}
                                        onWidgetInteraction={onSendCommand}
                                        onNavigate={onNavigate}
                                    />
                                </motion.div>
                            )}

                            {/* Perspective 2: Bio-Digital Living Organism */}
                            {activeTab === 'organism' && (
                                <motion.div
                                    key="tab-organism"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                            <div>
                                                <h3 className="font-comfortaa font-bold text-lg text-white">
                                                    Bio-Digital Living Syncytium
                                                </h3>
                                                <p className="text-xs text-text-secondary mt-0.5 font-lexend">
                                                    System health and liquidity conduits behaving as sentient biological circulatory systems.
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-mono text-patina-green bg-patina-green/10 border border-patina-green/20 px-2.5 py-1 rounded-full uppercase">
                                                Respiration: Nominal
                                            </span>
                                        </div>

                                        {/* Living Veins (System Health) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <BioDigitalVein
                                                systemLoad={isSelfOrganizing ? 88 : 42}
                                                errorRate={0}
                                                label="Neural Lattice Syncytium"
                                            />
                                            <BioDigitalVein
                                                systemLoad={totalAgents > 0 ? (activeAgents / totalAgents) * 70 : 35}
                                                errorRate={0}
                                                label="Swarm Execution Arteries"
                                            />
                                        </div>

                                        {/* Living Flows (Liquidity & Data) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <BioDigitalFlow
                                                fillPercentage={profitVelocity > 0 ? profitVelocity : 72}
                                                payloadSizeMb={28}
                                                label="Xi Treasury Liquidity Chamber"
                                                sublabel="Antifragile Capital Conduit"
                                            />
                                            <BioDigitalFlow
                                                fillPercentage={projectProgress}
                                                payloadSizeMb={84}
                                                label="Cognitive Data Viscosity"
                                                sublabel="Autonomous Synthesis Reservoir"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Perspective 3: Perpetual Market Sensing Radar */}
                            {activeTab === 'radar' && (
                                <motion.div
                                    key="tab-radar"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MarketSenseRadar
                                        signals={signals}
                                        maneuvers={maneuvers}
                                        onExecuteManeuver={executeManeuver}
                                    />
                                </motion.div>
                            )}

                            {/* Perspective 4: Value Streams */}
                            {activeTab === 'streams' && (
                                <motion.div
                                    key="tab-streams"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ValueStreamMatrix
                                        streams={streams}
                                        onTriggerRebalance={triggerSelfOrganization}
                                        isSelfOrganizing={isSelfOrganizing}
                                    />
                                </motion.div>
                            )}

                            {/* Perspective 5: Antifragility Crucible */}
                            {activeTab === 'crucible' && (
                                <motion.div
                                    key="tab-crucible"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <AntifragilityCrucible
                                        systemPhi={avgPhi}
                                        activeShock={activeChaosShock}
                                        countdown={chaosCountdown}
                                        chaosHistory={chaosHistory}
                                        onInjectShock={injectChaosStress}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Docked Action Bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-obsidian-black via-obsidian-black/95 to-transparent z-50">
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

            {/* Inline noise overlay without external fragile URL */}
            <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.025] bg-repeat [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
    );
};

export default MainView;
