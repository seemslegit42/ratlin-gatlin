
/**
 * @file modules/economy/XiDashboard.tsx
 * @description The Sovereign Command Deck for the Syndicate Economy.
 * Treasury UI backed by Appwrite TablesDB and user profile state.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { View, CurrentUser, KlepsydraOutcome, SREParams } from '../../types.js';
import BackButton from '../../components/shared/BackButton.js';
import { fetchEconomyData, type XiFlowData } from '../../services/xiEconomyService.js';
import SankeyFlow from '../../components/economy/SankeyFlow.js';
import TreasuryWidget from '../../components/economy/TreasuryWidget.js';
import { GovernancePanel } from '../../components/economy/GovernancePanel.js';
import Obelisk from '../../components/ambient/Obelisk.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon.js';
import { ChaosDeckView } from './ChaosDeckView.js';
import { useChaosEconomy } from '../../hooks/useChaosEconomy.js';
import { ModuleCard } from '../shared/ModuleCard.js';
import { Sparkline } from '../../components/marketing/MarketingMetrics.js';
import { MetronomeWave } from '../../components/economy/MetronomeWave.js';
import { calculateOutcome, ensurePulseProfile } from '../../services/klepsydraService.js';
import { useNotifications } from '../../contexts/NotificationContext.js';
import { LockIcon } from '../../components/icons/LockIcons.js';

interface XiDashboardProps {
    onNavigate: (view: View) => void;
}

const FollyInstrumentCard: React.FC<{ 
    id: string;
    name: string; 
    type: string; 
    desc: string; 
    color: string;
    onExecute: (id: string) => void;
    isProcessing: boolean;
}> = ({ id, name, type, desc, color, onExecute, isProcessing }) => {
    return (
        <div className={`p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-${color}/50 transition-all group relative overflow-hidden flex flex-col justify-between h-56`}>
            <div className={`absolute top-0 right-0 w-4 h-4 bg-${color} opacity-10 group-hover:opacity-40 rounded-bl-3xl transition-opacity`} />
            
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest text-${color}`}>{type}</span>
                </div>
                <h4 className="font-bold text-white text-lg font-comfortaa">{name}</h4>
                <p className="text-xs text-text-tertiary mt-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity italic">"{desc}"</p>
            </div>
            
            <button 
                onClick={() => onExecute(id)}
                disabled={isProcessing}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 relative overflow-hidden group/btn"
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>BRANCHING NEON</span>
                    </div>
                ) : (
                    <span className="relative z-10 group-hover/btn:text-white">Offer Tribute (100 Ξ)</span>
                )}
                <div className={`absolute inset-0 bg-${color} opacity-0 group-hover/btn:opacity-20 transition-opacity`} />
            </button>
        </div>
    );
};

const XiDashboard: React.FC<XiDashboardProps> = ({ onNavigate }) => {
    const { currentUser, updateUser } = useAuth();
    const { addNotification } = useNotifications();
    const [flowData, setFlowData] = useState<XiFlowData | null>(null);
    const [activeTab, setActiveTab] = useState<'treasury' | 'folly' | 'chaos' | 'governance'>('treasury');
    const [isExecuting, setIsExecuting] = useState(false);
    const [sreParams, setSreParams] = useState<SREParams | null>(null);

    const handleXiUpdate = (amount: number) => {
        if (currentUser) {
            updateUser({ xiBalance: currentUser.xiBalance + amount });
        }
    };

    const { activeEffects, activateCard } = useChaosEconomy(currentUser, handleXiUpdate);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchEconomyData();
            setFlowData(data);
            if (currentUser) {
                const profile = await ensurePulseProfile(currentUser.id);
                if (profile) setSreParams(profile.sreParams);
            }
        };
        void loadData();
    }, [currentUser?.id]);

    const handleExecuteFolly = useCallback(async (id: string) => {
        if (!currentUser || currentUser.xiBalance < 100) {
            addNotification("Insufficient Ξ for ritual tribute.", "error");
            return;
        }

        setIsExecuting(true);
        try {
            // 1. NEON HANDSHAKE: Logic for Double-Secure Branching
            await updateUser({ xiBalance: currentUser.xiBalance - 100 });
            
            const outcome = await calculateOutcome(currentUser, id, 100);
            
            // Wait for dramatic effect
            await new Promise(r => setTimeout(r, 1200));

            // Process Boon
            if (outcome.boonAmount > 0) {
                const updates: any = {};
                if (outcome.boonType === 'Ξ') updates.xiBalance = currentUser.xiBalance - 100 + outcome.boonAmount;
                else if (outcome.boonType === 'Φ') updates.phiBalance = currentUser.phiBalance + outcome.boonAmount;
                
                await updateUser(updates);
                addNotification(outcome.narrativeTrigger, "success");
            } else {
                addNotification(outcome.narrativeTrigger, "info");
            }
        } catch (e) {
            addNotification("Synaptic fault in Treasury interface.", "error");
        } finally {
            setIsExecuting(false);
        }
    }, [currentUser, updateUser, addNotification]);

    if (!flowData || !currentUser) return null;

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 md:space-y-6 bg-obsidian-black relative selection:bg-patina-green/30 high-density">
            <div className="flex items-center justify-between">
                <BackButton onClick={() => onNavigate('main')} label="Cockpit" />
                <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl backdrop-blur-xl">
                    {(['treasury', 'folly', 'chaos', 'governance'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${
                                activeTab === tab ? 'text-white' : 'text-text-tertiary hover:text-white'
                            }`}
                        >
                            {activeTab === tab && <motion.div layoutId="econ-tab" className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg shadow-md" />}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>
            </div>

            <header className="border-b border-white/10 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-comfortaa text-white tracking-tighter flex items-center gap-3">
                        The \Xi Treasury
                        <ShieldCheckIcon className="w-6 h-6 text-patina-green" />
                    </h1>
                    <p className="text-xs text-text-tertiary font-mono tracking-[0.2em] uppercase mt-0.5">Substrate: Appwrite TablesDB // Sovereign Ledger</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-mono text-text-tertiary uppercase">Financial Root</span>
                    <div className="text-4xl font-mono font-bold text-patina-green">
                        {currentUser.ageOfAscension ? currentUser.phiBalance : currentUser.xiBalance.toLocaleString()} 
                        <span className="text-lg ml-1">{currentUser.ageOfAscension ? 'Φ' : 'Ξ'}</span>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'treasury' && (
                    <motion.div 
                        key="treasury"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
                            <div className="lg:col-span-8">
                                <SankeyFlow data={flowData} />
                            </div>
                            <div className="lg:col-span-4">
                                <TreasuryWidget balance={currentUser.xiBalance} transactions={[]} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             <ModuleCard title="Double-Secure Ledger" className="relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <LockIcon className="w-24 h-24 text-roman-aqua" />
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <span className="text-sm font-bold text-roman-aqua uppercase tracking-widest">Appwrite Ledger</span>
                                    <p className="text-[10px] text-text-tertiary mt-1">Treasury and tribute rows persist in the sovereign database per syndicate.</p>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <h4 className="text-[10px] font-black text-white uppercase mb-1">Status: SECURED</h4>
                                    <p className="text-[10px] text-text-tertiary leading-relaxed">
                                       Transaction verification achieved through Zero-Knowledge proofs and branch isolation.
                                    </p>
                                  </div>
                                </div>
                             </ModuleCard>

                             <ModuleCard title="Strategic Resonance" className="lg:col-span-1">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-3xl font-mono font-bold text-imperial-purple">
                                      {currentUser.resonanceScore}%
                                    </span>
                                    <div className="w-2 h-2 rounded-full bg-imperial-purple animate-pulse" />
                                  </div>
                                  <div className="h-16 opacity-50">
                                    <Sparkline data={[40, 55, 45, 60, 50, 75, 70]} color="#6A0DAD" />
                                  </div>
                                </div>
                             </ModuleCard>

                             <div className="lg:col-span-1 h-64 relative bg-panel-bg rounded-2xl border border-glass-border">
                                <Obelisk lifetimeBurn={542000} />
                             </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'folly' && (
                    <motion.div 
                        key="folly"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="max-w-6xl mx-auto space-y-8">
                            <div className="p-6 bg-gradient-to-r from-red-900/20 to-imperial-purple/20 border border-white/5 rounded-3xl relative overflow-hidden">
                                <h3 className="text-2xl font-bold font-comfortaa text-white mb-2">Cognitive Athletics: The Crucible</h3>
                                <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
                                    Time your sequence initiation with the Metronome for maximum yield. Transactions settled on the Appwrite sovereign ledger.
                                </p>
                            </div>
                            
                            {sreParams && <MetronomeWave params={sreParams} />}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FollyInstrumentCard 
                                    id="auspex" name="SpinForge" type="Superstition" 
                                    desc="An infinite spinner that monetizes 'near-misses' using the Judas Algorithm."
                                    color="roman-aqua" onExecute={handleExecuteFolly} isProcessing={isExecuting}
                                />
                                <FollyInstrumentCard 
                                    id="loom" name="MindMaze Ξ" type="Mastery" 
                                    desc="Recursive logic puzzle that sells 'Chronostasis' to perfectionists."
                                    color="patina-green" onExecute={handleExecuteFolly} isProcessing={isExecuting}
                                />
                                <FollyInstrumentCard 
                                    id="futures" name="Obelotto" type="Spite" 
                                    desc="A social lottery where users pay to 'dim' a rival's luck."
                                    color="red-400" onExecute={handleExecuteFolly} isProcessing={isExecuting}
                                />
                                <FollyInstrumentCard 
                                    id="crucible" name="Fortune Forge" type="Sunk Cost" 
                                    desc="A build-to-burn game where disasters are triggered at peak investment."
                                    color="imperial-purple" onExecute={handleExecuteFolly} isProcessing={isExecuting}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'chaos' && (
                    <ChaosDeckView 
                        onActivate={activateCard} 
                        activeCardIds={activeEffects.map(e => e.cardId)}
                        xiBalance={currentUser.xiBalance}
                    />
                )}

                {activeTab === 'governance' && (
                    <motion.div 
                        key="governance"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        <GovernancePanel />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default XiDashboard;
