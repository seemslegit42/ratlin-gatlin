
import React, { useState } from 'react';
import { ModuleCard } from '../shared/ModuleCard';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { InventoryList } from '../../components/production/InventoryList';
import { SupplyChainVisualizer } from '../../components/production/SupplyChainVisualizer';
import BackButton from '../../components/shared/BackButton';
import type { View } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ZapIcon } from '../../components/icons/VitalsIcons';
import { MapleLeafIcon } from '../../components/icons/MapleLeafIcon';
import { SmartFactory } from '../../components/production/SmartFactory';
import { LogisticsCommand } from '../../components/production/LogisticsCommand';

interface ProductionViewProps {
    onNavigate: (view: View) => void;
}

const SustainabilityMetrics: React.FC = () => (
    <ModuleCard title="Eco-Impact Monitor" icon={<MapleLeafIcon className="w-5 h-5 text-patina-green" />}>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary">Carbon Footprint</span>
                <span className="text-sm font-mono text-patina-green">-12% YTD</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-patina-green h-full w-[65%]" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-white">840</div>
                    <div className="text-[9px] text-text-tertiary uppercase">Credits Earned</div>
                </div>
                <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-white">94%</div>
                    <div className="text-[9px] text-text-tertiary uppercase">Energy Efficiency</div>
                </div>
            </div>
        </div>
    </ModuleCard>
);

const DigitalPassportWidget: React.FC = () => {
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-bold text-vitreous-white">Digital Product Passport (DPP)</h4>
                    <span className="text-[10px] text-patina-green font-mono uppercase">Batch #994-A Verified</span>
                </div>
                <div className="p-2 bg-white/5 rounded border border-white/10">
                    <div className="w-8 h-8 bg-white p-0.5">
                        <div className="w-full h-full bg-black/90 flex items-center justify-center text-[6px] text-white text-center leading-none">
                            QR<br/>DATA
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary border-b border-white/5 pb-1">
                    <span>Carbon Footprint</span>
                    <span className="text-white">12.4 kg CO2e</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary border-b border-white/5 pb-1">
                    <span>Recyclability</span>
                    <span className="text-white">98% (Grade A)</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary pb-1">
                    <span>Chain of Custody</span>
                    <span className="text-roman-aqua">Immutable</span>
                </div>
            </div>
        </div>
    );
};

const DemandSensingAgent: React.FC = () => {
    return (
        <div className="bg-imperial-purple/10 border border-imperial-purple/30 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-imperial-purple/20 flex items-center justify-center text-imperial-purple animate-pulse">
                    <ZapIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Demand Oracle</h4>
                    <p className="text-[10px] text-text-tertiary max-w-[200px]">
                        Detected heatwave pattern in APAC region. 
                    </p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold text-patina-green">Auto-Adjusted</div>
                <div className="text-[10px] text-white">Cooling Units +15%</div>
            </div>
        </div>
    );
};

const ProductionView: React.FC<ProductionViewProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'forge' | 'logistics'>('overview');

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black/90 high-density">
            <div className="flex items-center space-x-4 mb-2">
                <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
            </div>
            <header className="mb-8 border-b border-white/10 pb-4 flex flex-col md:flex-row justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                        The Forge
                    </h1>
                    <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1">SCM // MANUFACTURING // SUSTAINABILITY</p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'overview' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                            : 'bg-white/5 text-text-secondary hover:text-white'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('forge')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'forge' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                            : 'bg-white/5 text-text-secondary hover:text-white'
                        }`}
                    >
                        Smart Factory
                    </button>
                    <button
                        onClick={() => setActiveTab('logistics')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'logistics' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                            : 'bg-white/5 text-text-secondary hover:text-white'
                        }`}
                    >
                        Logistics
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <SupplyChainVisualizer />
                            <SustainabilityMetrics />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <ModuleCard title="Production Pulse" className="lg:col-span-2">
                                <div className="space-y-4">
                                    <DemandSensingAgent />
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-vitreous-white">Alpha Line (CNC)</span>
                                            <span className="text-xs text-emerald-400 font-mono">AUTONOMOUS</span>
                                        </div>
                                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-1">
                                            <div className="bg-emerald-400 h-full w-[92%] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                        </div>
                                        <span className="text-[10px] text-text-tertiary">92% Utilization • OEE: 88%</span>
                                    </div>
                                    
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-vitreous-white">Beta Line (Assembly)</span>
                                            <span className="text-xs text-yellow-400 font-mono">MANNED</span>
                                        </div>
                                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-1">
                                            <div className="bg-yellow-400 h-full w-[78%]" />
                                        </div>
                                        <span className="text-[10px] text-text-tertiary">78% Utilization • Shift Change in 15m</span>
                                    </div>
                                </div>
                            </ModuleCard>

                            <ModuleCard title="Raw Material Levels" icon={<LayersIcon className="w-6 h-6 text-emerald-400" />}>
                                <InventoryList />
                            </ModuleCard>
                        </div>

                        <ModuleCard title="Quality Control & Provenance">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                                <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg">
                                    <div className="text-4xl font-bold text-emerald-400 mb-2 font-mono">0.02%</div>
                                    <div className="text-xs text-text-secondary uppercase tracking-widest text-center">Defect Rate</div>
                                    <p className="text-[9px] text-text-tertiary mt-2 text-center">
                                        Vision Agents Active. <br/> 24k units scanned.
                                    </p>
                                </div>
                                <DigitalPassportWidget />
                            </div>
                        </ModuleCard>
                    </motion.div>
                )}
                
                {activeTab === 'forge' && (
                    <motion.div
                        key="forge"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="h-full"
                    >
                        <SmartFactory />
                    </motion.div>
                )}

                {activeTab === 'logistics' && (
                    <motion.div
                        key="logistics"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="h-full"
                    >
                        <LogisticsCommand />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductionView;
