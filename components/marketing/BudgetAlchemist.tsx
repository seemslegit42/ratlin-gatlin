
/**
 * @file components/marketing/BudgetAlchemist.tsx
 * @description An interactive simulator for allocating marketing budget across channels
 * and visualizing projected ROAS (Return on Ad Spend) using a diminishing returns model.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { CoinsIcon } from '../icons/EconomyIcons';
import { TrendingUpIcon } from '../icons/VitalsIcons';

interface Channel {
    id: string;
    name: string;
    allocation: number; // $ value
    maxEfficientSpend: number; // Point of diminishing returns
    baseRoas: number; // Multiplier
    color: string;
}

export const BudgetAlchemist: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([
        { id: 'meta', name: 'Meta (FB/IG)', allocation: 5000, maxEfficientSpend: 15000, baseRoas: 3.5, color: 'accent-blue-500' },
        { id: 'google', name: 'Google Ads', allocation: 8000, maxEfficientSpend: 25000, baseRoas: 4.2, color: 'accent-green-500' },
        { id: 'tiktok', name: 'TikTok', allocation: 2000, maxEfficientSpend: 8000, baseRoas: 2.8, color: 'accent-pink-500' },
    ]);

    const [totalBudget, setTotalBudget] = useState(0);
    const [projectedRevenue, setProjectedRevenue] = useState(0);
    const [blendedRoas, setBlendedRoas] = useState(0);

    // Recalculate metrics whenever channels change
    useEffect(() => {
        let budget = 0;
        let revenue = 0;

        channels.forEach(ch => {
            budget += ch.allocation;
            
            // Diminishing Returns Logic: 
            // Efficiency drops as spend exceeds maxEfficientSpend
            const efficiencyRatio = Math.max(0.5, 1 - (Math.max(0, ch.allocation - ch.maxEfficientSpend) / (ch.maxEfficientSpend * 2)));
            const actualRoas = ch.baseRoas * efficiencyRatio;
            
            revenue += ch.allocation * actualRoas;
        });

        setTotalBudget(budget);
        setProjectedRevenue(revenue);
        setBlendedRoas(budget > 0 ? revenue / budget : 0);
    }, [channels]);

    const handleSliderChange = (id: string, newVal: number) => {
        setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, allocation: newVal } : ch));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Controls */}
            <ModuleCard title="Budget Allocation" className="lg:col-span-1">
                <div className="space-y-6">
                    {channels.map(ch => (
                        <div key={ch.id}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-vitreous-white">{ch.name}</span>
                                <span className="font-mono text-sm text-roman-aqua">${ch.allocation.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="30000" 
                                step="500"
                                value={ch.allocation}
                                onChange={(e) => handleSliderChange(ch.id, parseInt(e.target.value))}
                                className={`w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer ${ch.color}`}
                            />
                            <div className="flex justify-between text-[9px] text-text-tertiary mt-1">
                                <span>$0</span>
                                <span>Saturation: ${(ch.maxEfficientSpend).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-text-secondary uppercase font-bold">Total Spend</span>
                            <span className="text-lg font-bold font-mono text-white">${totalBudget.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </ModuleCard>

            {/* Projections */}
            <ModuleCard title="Projected Outcomes" icon={<CoinsIcon className="w-5 h-5 text-yellow-400" />} className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Forecasted Revenue</div>
                        <motion.div 
                            key={projectedRevenue}
                            initial={{ scale: 0.9, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold font-mono text-patina-green"
                        >
                            ${Math.round(projectedRevenue).toLocaleString()}
                        </motion.div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Blended ROAS</div>
                        <motion.div 
                            key={blendedRoas}
                            initial={{ scale: 0.9, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-3xl font-bold font-mono ${blendedRoas > 3.5 ? 'text-roman-aqua' : blendedRoas > 2.5 ? 'text-yellow-400' : 'text-red-400'}`}
                        >
                            {blendedRoas.toFixed(2)}x
                        </motion.div>
                    </div>
                </div>

                <div className="relative h-40 bg-black/30 rounded-lg border border-white/5 flex items-end px-4 pb-0 overflow-hidden">
                    {/* Simple Bar Chart Visualization */}
                    <div className="w-full flex justify-around items-end h-full gap-4">
                        {channels.map((ch, i) => {
                            const efficiencyRatio = Math.max(0.2, 1 - (Math.max(0, ch.allocation - ch.maxEfficientSpend) / (ch.maxEfficientSpend * 2)));
                            const barHeight = Math.min(100, (ch.allocation / 30000) * 100);
                            
                            return (
                                <div key={ch.id} className="flex-1 flex flex-col justify-end items-center group relative">
                                    <div className="text-[10px] font-mono text-white mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full">
                                        Eff: {(efficiencyRatio * 100).toFixed(0)}%
                                    </div>
                                    <motion.div 
                                        className={`w-full rounded-t-md opacity-80 hover:opacity-100 transition-opacity ${
                                            ch.id === 'meta' ? 'bg-blue-500' : ch.id === 'google' ? 'bg-green-500' : 'bg-pink-500'
                                        }`}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${barHeight}%` }}
                                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                    />
                                    <div className="h-1 w-full bg-white/10 mt-1" />
                                    <span className="text-[9px] text-text-tertiary mt-2 uppercase">{ch.name.split(' ')[0]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
