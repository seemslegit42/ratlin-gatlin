
/**
 * @file components/economy/XiDashboard.tsx
 * @description The Sovereign Command Deck for the Syndicate Economy.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { View, PactTier, TreasuryTransaction } from '../../types';
import BackButton from '../shared/BackButton';
import { fetchEconomyData, fetchCOGSBreakdown, fetchTreasuryTransactions, PACT_CONFIGS, type XiFlowData, type COGSComponent } from '../../services/xiEconomyService';
import SankeyFlow from './SankeyFlow';
import COGSBreakdown from './COGSBreakdown';
import TreasuryWidget from './TreasuryWidget';
import { GovernancePanel } from './GovernancePanel';
import Obelisk from '../ambient/Obelisk';
import { CEVMCalculator } from './CEVMCalculator';
import { PricingTiers } from './PricingTiers';
import PaymentModal from '../payment/PaymentModal';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { BrainIcon } from '../icons/BrainIcon';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { LayersIcon } from '../icons/LayersIcon';
// Fix: Added missing import for ModuleCard
import { ModuleCard } from '../../modules/shared/ModuleCard';

interface XiDashboardProps {
    onNavigate: (view: View) => void;
}

const PactMastery: React.FC<{ currentPact: PactTier }> = ({ currentPact }) => {
    const config = PACT_CONFIGS[currentPact];
    return (
        <div className="bg-panel-bg/40 backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-glass flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <ShieldCheckIcon className="w-32 h-32 text-patina-green" />
            </div>
            
            <div className="mb-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-patina-green uppercase tracking-[0.3em]">Active Pact</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
                </div>
                <h3 className="text-4xl font-bold font-comfortaa text-white tracking-tighter">{currentPact}</h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed opacity-70">
                    Sovereign access to {config.opsLimit.toLocaleString()} CogniOps per cycle. Priority neural routing enforced.
                </p>
            </div>

            <div className="space-y-3 mt-auto relative z-10">
                <h4 className="text-[9px] font-black text-text-tertiary uppercase tracking-widest border-b border-white/5 pb-2">Entitlements</h4>
                {config.features.map(f => (
                    <div key={f} className="flex items-center gap-3 text-xs text-vitreous-white/90">
                        <div className="w-1.5 h-1.5 rounded-full bg-patina-green shadow-[0_0_5px_var(--patina-green)]" />
                        {f}
                    </div>
                ))}
            </div>

            <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all">
                Ascend to Next Pact
            </button>
        </div>
    );
};

const FollyConsole: React.FC = () => {
    const instruments = [
        { id: 'spin', name: 'SpinForge', desc: 'Infinite momentum generator.', yield: 'High', status: 'LIVE', color: 'text-patina-green' },
        { id: 'maze', name: 'MindMaze Xi', desc: 'Recursive logic extraction.', yield: 'Stable', status: 'IDLE', color: 'text-roman-aqua' },
        { id: 'obel', name: 'Obelotto', desc: 'Gravitational luck pool.', yield: 'Volatile', status: 'LIVE', color: 'text-red-400' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instruments.map(inst => (
                <button key={inst.id} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-roman-aqua/30 transition-all text-left group">
                    <div className="flex justify-between items-start mb-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${inst.color}`}>{inst.name}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${inst.status === 'LIVE' ? 'bg-patina-green animate-pulse' : 'bg-text-tertiary'}`} />
                    </div>
                    <p className="text-[10px] text-text-tertiary mb-4 leading-relaxed line-clamp-2">"{inst.desc}"</p>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-text-tertiary uppercase">Yield Potential</span>
                            <span className="text-xs font-mono text-white">{inst.yield}</span>
                        </div>
                        <span className="text-[10px] font-black text-roman-aqua opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Execute &rarr;</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

const XiDashboard: React.FC<XiDashboardProps> = ({ onNavigate }) => {
    const { addNotification } = useNotifications();
    const { currentUser } = useAuth();
    const [flowData, setFlowData] = useState<XiFlowData | null>(null);
    const [activeTab, setActiveTab] = useState<'treasury' | 'folly' | 'governance'>('treasury');

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchEconomyData();
            setFlowData(data);
        };
        void loadData();
    }, []);

    if (!flowData || !currentUser) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-obsidian-black text-text-tertiary">
            <div className="w-10 h-10 border-2 border-imperial-purple border-t-transparent rounded-full animate-spin mb-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing Neural Reserves...</span>
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-6 space-y-6 bg-obsidian-black relative selection:bg-patina-green/30 high-density">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <BackButton onClick={() => onNavigate('main')} label="Cockpit" />
                <div className="flex items-center space-x-3 px-4 py-2 bg-black/60 rounded-2xl border border-white/10 shadow-2xl">
                    <ShieldCheckIcon className="w-4 h-4 text-patina-green" />
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Obelisk Pay: Secured</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                <div className="space-y-1">
                    <h1 className="text-5xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-br from-white via-vitreous-white to-gray-500 tracking-tighter">
                        The \Xi Treasury
                    </h1>
                    <p className="text-sm text-text-tertiary font-mono tracking-[0.3em] uppercase">Sovereign Financial Protocol // Central Bank Root</p>
                </div>
                
                <div className="flex p-1.5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
                    {(['treasury', 'folly', 'governance'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                activeTab === tab ? 'text-white' : 'text-text-tertiary hover:text-white'
                            }`}
                        >
                            {activeTab === tab && <motion.div layoutId="econ-tab" className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-lg" />}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'treasury' && (
                    <motion.div 
                        key="treasury"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
                            <div className="lg:col-span-3 h-full">
                                <PactMastery currentPact={currentUser.pact} />
                            </div>
                            <div className="lg:col-span-6 h-full flex flex-col space-y-6">
                                <div className="flex-grow">
                                    <SankeyFlow data={flowData} />
                                </div>
                                <div className="h-48 bg-panel-bg border border-glass-border rounded-2xl p-6 flex flex-col justify-between overflow-hidden group">
                                     <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-roman-aqua/20 rounded-lg text-roman-aqua">
                                                <TrendingUpIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Growth Helix</h4>
                                                <p className="text-[10px] text-text-tertiary uppercase font-mono">Cycle 42 Velocity: +12.4%</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-mono text-text-tertiary uppercase">Transmutation Tithe</span>
                                            <div className="text-lg font-mono font-bold text-patina-green">18.0%</div>
                                        </div>
                                     </div>
                                     <div className="relative h-1 w-full bg-black/40 rounded-full overflow-hidden mt-4">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-patina-green via-roman-aqua to-transparent" 
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                        />
                                     </div>
                                </div>
                            </div>
                            <div className="lg:col-span-3 h-full">
                                <TreasuryWidget balance={currentUser.xiBalance} transactions={[]} />
                            </div>
                        </div>

                        <PricingTiers 
                            onPurchase={(plan, amount) => {
                                addNotification(`Initiating upgrade to ${plan}...`, 'info');
                                // In a real app, this would trigger the payment modal
                            }}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             <ModuleCard title="Cost Composition" className="lg:col-span-1">
                                <COGSBreakdown components={fetchCOGSBreakdown()} xiFloor={flowData.governance.baseRTR * 10} />
                             </ModuleCard>
                             <ModuleCard title="Lifetime Artifact" className="lg:col-span-2">
                                <div className="h-64 relative">
                                    <Obelisk lifetimeBurn={542000} />
                                </div>
                             </ModuleCard>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'governance' && (
                    <motion.div 
                        key="governance"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        <GovernancePanel />
                    </motion.div>
                )}

                {activeTab === 'folly' && (
                    <motion.div 
                        key="folly"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="p-10 bg-panel-bg/40 border border-glass-border rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-imperial-purple to-roman-aqua opacity-40" />
                            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                                <div className="max-w-xl">
                                    <h2 className="text-4xl font-bold font-comfortaa text-white mb-4 tracking-tighter">Instruments of Folly</h2>
                                    <p className="text-sm text-text-secondary leading-relaxed opacity-80">
                                        "The act of making a tribute is a thought, not a task." Engage with recursive logic puzzles and probability engines to synthesize additional $\Xi$ credits. Every wager feeds the Intelligence Flywheel.
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">Session Entropy</div>
                                    <div className="text-4xl font-mono font-bold text-white tracking-widest">0.1245</div>
                                </div>
                            </div>
                            
                            <div className="mt-12">
                                <FollyConsole />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ModuleCard title="Black Sigil (Sovereign Card)">
                                <div className="relative aspect-[1.58/1] w-full max-w-sm mx-auto bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 pointer-events-none" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-12 h-8 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10" />
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-patina-green uppercase tracking-widest">SOVEREIGN SIGIL</span>
                                        </div>
                                    </div>
                                    <div className="mt-10 relative z-10">
                                        <div className="text-xl font-mono tracking-[0.2em] text-vitreous-white opacity-90">Ξ 0402 1194 0000 8421</div>
                                        <div className="mt-6 flex justify-between items-end">
                                            <div>
                                                <div className="text-[7px] text-text-tertiary uppercase tracking-widest mb-1">Ritual Signatory</div>
                                                <div className="text-xs font-bold uppercase tracking-widest text-white">{currentUser.name}</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-50">
                                                <LayersIcon className="w-5 h-5 text-vitreous-white" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Holographic Sweep */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-roman-aqua/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </div>
                                <p className="text-[10px] text-text-tertiary text-center mt-6 italic">
                                    "Physical matte obsidian aluminum command card. Debit $\Xi$ reserves at standard payment terminals."
                                </p>
                            </ModuleCard>

                            <ModuleCard title="Sine-Rhythm Telemetry" icon={<ZapIcon className="w-5 h-5 text-roman-aqua" />}>
                                <div className="h-full flex flex-col justify-center space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Resonance Wave</span>
                                            <span className="text-xs font-mono text-patina-green font-bold">ALIGNED</span>
                                        </div>
                                        <div className="flex items-end gap-1 h-16">
                                            {[...Array(20)].map((_, i) => {
                                                const h = Math.sin(i * 0.5 + Date.now()/2000) * 30 + 50;
                                                return (
                                                    <div key={i} className="flex-1 bg-roman-aqua/40 rounded-full" style={{ height: `${h}%` }} />
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                        <h5 className="text-[9px] font-black text-vitreous-white uppercase tracking-widest mb-1">SRE Status</h5>
                                        <p className="text-[10px] text-text-tertiary leading-relaxed">
                                            Personalized waves of luck are peaking. Tribute Efficiency +14.2% for the next 14:02 minutes.
                                        </p>
                                    </div>
                                </div>
                            </ModuleCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default XiDashboard;