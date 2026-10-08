
/**
 * @file modules/finance/FinanceView.tsx
 * @description The Sovereign's Ledger. Orchestrates autonomous financial intelligence (FoundersFocus),
 * integrating grant funding, project lifecycles (PLM), and compliance automation.
 */

import React, { useState } from 'react';
import { ModuleCard } from '../shared/ModuleCard';
import { CoinsIcon } from '../../components/icons/EconomyIcons';
import { CashFlowTrend } from '../../components/finance/CashFlowTrend';
import { AccountsReceivable } from '../../components/finance/AccountsReceivable';
import { TaxVaultStatus } from '../../components/finance/TaxVaultStatus';
import { GeneralLedger } from '../../components/finance/GeneralLedger';
import BackButton from '../../components/shared/BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import type { View } from '../../types';
import { LayersIcon } from '../../components/icons/LayersIcon';

import { FinancialModel } from '../../components/finance/foundersfocus/FinancialModel';
import { BusinessPlanGenerator } from '../../components/finance/foundersfocus/BusinessPlanGenerator';
import { ComplianceCSRS4200 } from '../../components/finance/foundersfocus/ComplianceCSRS4200';
import { AlbertaGrants } from '../../components/finance/foundersfocus/AlbertaGrants';
import { CapTable } from '../../components/finance/foundersfocus/CapTable';
import { ExitStrategy } from '../../components/finance/foundersfocus/ExitStrategy';
import AVFCommandDeck from '../../components/finance/foundersfocus/AVFCommandDeck';

interface FinanceViewProps {
    /** Navigation callback. */
    onNavigate: (view: View) => void;
}

type Tab = 'overview' | 'model' | 'chronos' | 'plan' | 'compliance' | 'grants' | 'equity' | 'avf';

/**
 * Visual feedback for real-time sync with other OS modules.
 */
const IntegratedDataFlow: React.FC = () => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-roman-aqua/30 transition-colors cursor-default">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-imperial-purple/20 flex items-center justify-center text-imperial-purple">
                <LayersIcon className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-white">Cross-Module Integration</h4>
                <p className="text-[10px] text-text-tertiary">Real-time sync: Procurement & Marketing</p>
            </div>
        </div>
    </div>
);

/**
 * Main financial dashboard container.
 */
interface PLMStage {
    id: string;
    name: string;
    gate: string;
    progress: number;
    status: 'Completed' | 'In-Review' | 'Active' | 'Pending';
    lead: string;
    bomTarget: number;
    bomActual: number;
    tasksCount: number;
}

const INITIAL_PLM_STAGES: PLMStage[] = [
    { id: 'stg-1', name: 'Concept & Spec Matrix', gate: 'Gate 0: Feasibility', progress: 100, status: 'Completed', lead: 'Sovereign Core', bomTarget: 12000, bomActual: 11400, tasksCount: 14 },
    { id: 'stg-2', name: 'Neural & Hardware Prototyping', gate: 'Gate 1: EVT Release', progress: 85, status: 'In-Review', lead: 'Axiom Chen', bomTarget: 48000, bomActual: 46200, tasksCount: 22 },
    { id: 'stg-3', name: 'Digital Twin Simulation', gate: 'Gate 2: DVT Verification', progress: 60, status: 'Active', lead: 'Simulacrum Node', bomTarget: 32000, bomActual: 33500, tasksCount: 18 },
    { id: 'stg-4', name: 'Compliance & CSRS-4200 Audit', gate: 'Gate 3: PVT Pilot', progress: 35, status: 'Pending', lead: 'Sentinel Aegis', bomTarget: 18000, bomActual: 18000, tasksCount: 12 },
    { id: 'stg-5', name: 'Scaled Sovereign Manufacturing', gate: 'Gate 4: Mass Production', progress: 10, status: 'Pending', lead: 'Operations Swarm', bomTarget: 95000, bomActual: 92000, tasksCount: 30 },
];

const ChronosPLM: React.FC = () => {
    const [stages, setStages] = useState<PLMStage[]>(INITIAL_PLM_STAGES);
    const [selectedStage, setSelectedStage] = useState<PLMStage>(INITIAL_PLM_STAGES[1]);

    const totalTarget = stages.reduce((acc, s) => acc + s.bomTarget, 0);
    const totalActual = stages.reduce((acc, s) => acc + s.bomActual, 0);
    const overallProgress = Math.round(stages.reduce((acc, s) => acc + s.progress, 0) / stages.length);

    const advanceStage = (id: string) => {
        setStages(prev => prev.map(s => {
            if (s.id !== id) return s;
            const nextProgress = Math.min(100, s.progress + 15);
            return {
                ...s,
                progress: nextProgress,
                status: nextProgress === 100 ? 'Completed' : 'Active'
            };
        }));
    };

    return (
        <div className="space-y-6 font-lexend">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 border border-white/10 p-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold font-comfortaa text-white">Chronos Product Lifecycle Management</h2>
                    <p className="text-xs text-text-tertiary font-mono tracking-widest mt-1 uppercase">
                        Stage-Gate Hardware & Sovereign System Lifecycles
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-text-tertiary uppercase font-mono">Overall Readiness</div>
                        <div className="text-xl font-bold font-comfortaa text-patina-green">{overallProgress}%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-text-tertiary uppercase font-mono">BOM Variance</div>
                        <div className={`text-xl font-bold font-comfortaa ${totalActual <= totalTarget ? 'text-patina-green' : 'text-red-400'}`}>
                            {totalActual <= totalTarget ? '-' : '+'}${Math.abs(totalTarget - totalActual).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        onClick={() => setSelectedStage(stage)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedStage.id === stage.id
                                ? 'bg-imperial-purple/20 border-patina-green shadow-[0_0_15px_rgba(62,185,145,0.2)]'
                                : 'bg-black/30 border-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-mono text-text-tertiary uppercase">{stage.gate}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                stage.status === 'Completed' ? 'bg-patina-green/20 text-patina-green' :
                                stage.status === 'In-Review' ? 'bg-yellow-400/20 text-yellow-400' :
                                stage.status === 'Active' ? 'bg-roman-aqua/20 text-roman-aqua' :
                                'bg-white/5 text-text-tertiary'
                            }`}>
                                {stage.status}
                            </span>
                        </div>
                        <h4 className="text-xs font-bold font-comfortaa text-white truncate mb-2">{stage.name}</h4>
                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-patina-green h-full transition-all duration-500" style={{ width: `${stage.progress}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
                            <span>{stage.progress}%</span>
                            <span>{stage.lead}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stage Detail & Gate Controller */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <div>
                            <span className="text-[10px] font-mono text-patina-green uppercase tracking-wider">{selectedStage.gate}</span>
                            <h3 className="text-xl font-bold font-comfortaa text-white mt-1">{selectedStage.name}</h3>
                        </div>
                        <button
                            onClick={() => advanceStage(selectedStage.id)}
                            className="px-4 py-2 bg-patina-green/20 border border-patina-green/40 hover:bg-patina-green/30 text-patina-green text-xs font-bold rounded-lg transition-all"
                        >
                            Execute Gate Step (+15%)
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="text-[10px] text-text-tertiary uppercase font-mono">Stage Lead</div>
                            <div className="text-sm font-bold text-white mt-1">{selectedStage.lead}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="text-[10px] text-text-tertiary uppercase font-mono">BOM Allocation</div>
                            <div className="text-sm font-bold text-roman-aqua mt-1">${selectedStage.bomTarget.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="text-[10px] text-text-tertiary uppercase font-mono">Actual Spend</div>
                            <div className="text-sm font-bold text-white mt-1">${selectedStage.bomActual.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h4 className="text-xs font-bold font-comfortaa text-white uppercase tracking-wider mb-2">Gate Criteria & Deliverables</h4>
                        <ul className="space-y-2 text-xs text-text-secondary">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-patina-green" />
                                Schematic & Bill of Materials (BOM) cross-referenced with Appwrite Procurement.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-roman-aqua" />
                                Thermal and cryptographic dissipation simulation completed in Simulacrum.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-imperial-purple" />
                                Sovereign Security audit and zero-trust protocol check passed.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold font-comfortaa text-white">PLM Telemetry</h3>
                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-text-tertiary">Active Engineering Tasks</span>
                            <span className="font-mono text-white font-bold">{selectedStage.tasksCount} Tasks</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-text-tertiary">Eco-Impact Score</span>
                            <span className="font-mono text-patina-green font-bold">Grade A (94%)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-text-tertiary">Digital Product Passport</span>
                            <span className="font-mono text-roman-aqua font-bold">VERIFIED #PLM-2026</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-text-tertiary">Supply Risk Index</span>
                            <span className="font-mono text-yellow-400 font-bold">0.14 (Low)</span>
                        </div>
                    </div>
                    <div className="p-3 bg-imperial-purple/10 border border-imperial-purple/20 rounded-lg text-[10px] text-text-secondary leading-relaxed">
                        Cross-synchronized with Procurement Orders and Smart Factory Digital Passports via Appwrite Sovereign Tables.
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinanceView: React.FC<FinanceViewProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('model');
    const [connectedGrantFunding, setConnectedGrantFunding] = useState(0);
    const [connectedInKind, setConnectedInKind] = useState(0);

    /**
     * Updates the financial engine with regional ecosystem values.
     */
    const handleGrantUpdates = (funding: number, inKind: number) => {
        setConnectedGrantFunding(funding);
        setConnectedInKind(inKind);
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'model', label: 'Financial Engine' },
        { id: 'avf', label: 'AVF Command Deck' },
        { id: 'equity', label: 'Equity & Exit' },
        { id: 'chronos', label: 'Chronos (PLM)' },
        { id: 'grants', label: 'Regional Ecosystem' },
        { id: 'plan', label: 'Business Plan' },
        { id: 'compliance', label: 'Compliance (4200)' },
    ];

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 flex flex-col bg-obsidian-black/80 high-density">
            <div className="flex-shrink-0">
                <div className="flex items-center space-x-4 mb-2">
                    <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            FoundersFocus
                        </h1>
                        <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1">AUTONOMOUS FINANCIAL INTELLIGENCE</p>
                    </div>
                    
                    <div className="flex space-x-1 bg-black/20 p-1 rounded-xl mt-4 md:mt-0 overflow-x-auto max-w-full border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    activeTab === tab.id ? 'text-black' : 'text-text-secondary hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {activeTab === tab.id && <motion.div layoutId="finance-tab-bg" className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-sm" />}
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <ModuleCard title="Cash Flow" icon={<CoinsIcon className="w-6 h-6 text-yellow-400"/>}>
                                        <CashFlowTrend />
                                    </ModuleCard>
                                    <AccountsReceivable />
                                    <TaxVaultStatus />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2"><GeneralLedger /></div>
                                    <div className="space-y-6"><IntegratedDataFlow /></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'model' && <FinancialModel grantFunding={connectedGrantFunding} inKindValue={connectedInKind} />}
                        {activeTab === 'avf' && <AVFCommandDeck />}
                        {activeTab === 'equity' && (
                            <div className="space-y-8">
                                <CapTable />
                                <div className="h-px bg-white/5 w-full" />
                                <ExitStrategy />
                            </div>
                        )}
                        {activeTab === 'grants' && <AlbertaGrants onUpdateFinancials={handleGrantUpdates} />}
                        {activeTab === 'chronos' && <ChronosPLM />}
                        {activeTab === 'plan' && <BusinessPlanGenerator />}
                        {activeTab === 'compliance' && <ComplianceCSRS4200 />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FinanceView;
