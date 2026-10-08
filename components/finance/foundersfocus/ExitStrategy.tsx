import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../../modules/shared/ModuleCard';
import { RadarIcon } from '../../icons/SecurityIcons';
import { TrendingUpIcon } from '../../icons/VitalsIcons';

interface ExitScenario {
    id: string;
    type: 'Acquisition' | 'IPO' | 'Secondary';
    valuation: number;
    probability: number;
    timeframe: string;
    description: string;
}

const scenarios: ExitScenario[] = [
    { 
        id: '1', 
        type: 'Acquisition', 
        valuation: 250000000, 
        probability: 65, 
        timeframe: '24-36 months',
        description: 'Strategic absorption by a primary AI infrastructure provider seeking Syndicate talent.'
    },
    { 
        id: '2', 
        type: 'IPO', 
        valuation: 1200000000, 
        probability: 15, 
        timeframe: '60+ months',
        description: 'Public listing on the Aevon Neural Exchange. High regulatory friction expected.'
    },
    { 
        id: '3', 
        type: 'Secondary', 
        valuation: 150000000, 
        probability: 20, 
        timeframe: '12-18 months',
        description: 'Partial liquidity event for early investors and founders through private secondary market.'
    },
];

export const ExitStrategy: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<ExitScenario>(scenarios[0]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <ModuleCard title="Scenario Modeling: Outcomes" icon={<TrendingUpIcon className="w-5 h-5 text-roman-aqua" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {scenarios.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedScenario(s)}
                                className={`p-4 rounded-xl border transition-all text-left group ${
                                    selectedScenario.id === s.id 
                                    ? 'bg-roman-aqua/10 border-roman-aqua shadow-[0_0_20px_rgba(32,178,170,0.15)]' 
                                    : 'bg-black/20 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{s.type}</div>
                                <div className="text-xl font-bold text-white group-hover:text-roman-aqua transition-colors">${(s.valuation / 1000000).toFixed(0)}M</div>
                                <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.probability}%` }}
                                        className="h-full bg-roman-aqua"
                                    />
                                </div>
                                <div className="mt-1 flex justify-between text-[8px] font-mono text-text-tertiary">
                                    <span>Prob: {s.probability}%</span>
                                    <span>{s.timeframe}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={selectedScenario.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-black/40 rounded-2xl border border-white/5 p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-2">{selectedScenario.type} Strategy: {selectedScenario.timeframe}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                                "{selectedScenario.description}"
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Payout Matrix (Founders)</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <span className="text-xs text-text-secondary">Gross Payout</span>
                                            <span className="text-sm font-mono text-patina-green font-bold">${(selectedScenario.valuation * 0.5 / 1000000).toFixed(1)}M</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border-l-4 border-orange-500">
                                            <span className="text-xs text-text-secondary">Est. Carry & Taxes</span>
                                            <span className="text-sm font-mono text-orange-500">-${(selectedScenario.valuation * 0.5 * 0.25 / 1000000).toFixed(1)}M</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-patina-green/10 rounded-lg border border-patina-green/20">
                                            <span className="text-xs font-bold text-patina-green uppercase">Net Liquidity</span>
                                            <span className="text-lg font-mono text-patina-green font-black">${(selectedScenario.valuation * 0.5 * 0.75 / 1000000).toFixed(1)}M</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Risk Vectors</h4>
                                    <div className="space-y-3">
                                        {['Regulatory Headwinds', 'Neural Saturation', 'Talent Drift'].map((risk, i) => (
                                            <div key={risk} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                                                <div className="w-1 h-1 rounded-full bg-roman-aqua animate-pulse" />
                                                <span className="text-xs text-text-secondary">{risk}</span>
                                                <div className="ml-auto w-12 h-1 bg-white/10 rounded-full">
                                                    <div className="h-full bg-roman-aqua" style={{ width: `${(i+1) * 30}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </ModuleCard>
            </div>

            <div className="space-y-6">
                <ModuleCard title="Tactical Gambit" icon={<RadarIcon className="w-5 h-5 text-red-500" />}>
                     <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[11px] leading-relaxed text-text-secondary">
                            Based on current <span className="text-white font-bold">Burn Rate ($42k/mo)</span> and <span className="text-white font-bold">Xi Accumulation (4.2/day)</span>, the optimal exit window stabilizes in <span className="text-roman-aqua font-bold">Q3 2027</span>.
                        </div>
                        <button className="w-full py-3 bg-gradient-to-r from-roman-aqua to-patina-green text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-roman-aqua/20 transition-all active:scale-95">
                            Run Neural Simulation
                        </button>
                    </div>
                </ModuleCard>
                
                <ModuleCard title="Economic Convergence" icon={null}>
                    <div className="relative h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,150,0.1),transparent_70%)]" />
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border border-roman-aqua/30 rounded-full border-dashed"
                        />
                        <div className="absolute flex flex-col items-center">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Convergence</span>
                            <span className="text-lg font-bold text-roman-aqua">0.824</span>
                        </div>
                    </div>
                </ModuleCard>
            </div>
        </div>
    );
};
