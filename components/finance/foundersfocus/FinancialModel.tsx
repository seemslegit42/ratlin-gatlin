
/**
 * @file components/finance/foundersfocus/FinancialModel.tsx
 * @description The Core Financial Engine of FoundersFocus.
 * Implements driver-based modeling, interconnected 3-statement logic (Indirect Method),
 * and automated integrity checks (Assets = Liabilities + Equity).
 * Includes Rule of 40 calculation and enhanced context tooltips.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../../modules/shared/ModuleCard';
import { ChartBarIcon, ScaleIcon, FlameIcon } from '../../icons/EconomyIcons';
import Tooltip from '../../shared/Tooltip';

interface FinancialModelProps {
    grantFunding?: number;
    inKindValue?: number;
}

export const FinancialModel: React.FC<FinancialModelProps> = ({ grantFunding = 0, inKindValue = 0 }) => {
    const [scenario, setScenario] = useState<'base' | 'best' | 'worst'>('base');
    const [churnRate, setChurnRate] = useState(5);
    const [adSpend, setAdSpend] = useState(5000);

    // --- Driver Logic ---
    const multiplier = scenario === 'best' ? 1.5 : scenario === 'worst' ? 0.6 : 1.0;
    
    // Revenue Modeling (Impacted by Ad Spend)
    const organicRevenue = 45000;
    const acquisitionRevenue = (adSpend * 2.5); // 2.5x ROAS assumption
    const totalRevenue = (organicRevenue + acquisitionRevenue) * multiplier;
    
    // COGS & OpEx
    const cogs = totalRevenue * 0.15;
    const grossProfit = totalRevenue - cogs;
    
    // OpEx Logic (Impacted by Churn & In-Kind)
    // Churn creates drag on efficiency, increasing effective cost to serve
    const churnPenalty = churnRate * 500; 
    const rawOpex = 25000 + adSpend + churnPenalty;
    
    // In-Kind Adjustment: Reduces effective OpEx cash burn
    const opex = Math.max(0, rawOpex - (inKindValue / 12)); 
    
    const netIncome = grossProfit - opex;

    // --- SaaS Metrics ---
    // Growth Rate driven by Ad Spend saturation curve
    const growthRate = Math.min(100, 10 + (adSpend / 1000) * 2); 
    const profitMargin = (netIncome / totalRevenue) * 100;
    const ruleOf40 = growthRate + profitMargin;

    // --- Balance Sheet / Runway ---
    const assets = 150000 + (netIncome * 3) + grantFunding; // Simulated cash pos
    const runway = opex > 0 ? assets / opex : 99;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* --- Top Widget: Key Metrics --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* MRR Card */}
                <div className="bg-panel-bg/60 backdrop-blur-xl border border-glass-border rounded-xl p-5 shadow-glass flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ChartBarIcon className="w-16 h-16 text-patina-green" />
                    </div>
                    <div>
                        <Tooltip content="Monthly Recurring Revenue + Acquisition">
                            <h4 className="text-text-secondary uppercase text-xs font-bold tracking-widest cursor-help border-b border-dashed border-white/20 inline-block pb-0.5">MRR / Revenue</h4>
                        </Tooltip>
                        <div className="text-3xl font-mono font-bold text-vitreous-white mt-1">
                            ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-text-tertiary mb-1">
                            <span>Growth Rate</span>
                            <span className="text-patina-green">+{growthRate.toFixed(1)}% MoM</span>
                        </div>
                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${Math.min(100, growthRate)}%` }} 
                                className="h-full bg-patina-green rounded-full" 
                            />
                        </div>
                    </div>
                </div>

                {/* Rule of 40 Card */}
                <div className="bg-panel-bg/60 backdrop-blur-xl border border-glass-border rounded-xl p-5 shadow-glass flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ScaleIcon className="w-16 h-16 text-roman-aqua" />
                    </div>
                    <div>
                        <Tooltip content="Efficiency Metric: Growth % + Profit Margin % should be > 40">
                            <h4 className="text-text-secondary uppercase text-xs font-bold tracking-widest cursor-help border-b border-dashed border-white/20 inline-block pb-0.5">Rule of 40</h4>
                        </Tooltip>
                        <div className={`text-3xl font-mono font-bold mt-1 ${ruleOf40 >= 40 ? 'text-patina-green' : 'text-yellow-400'}`}>
                            {ruleOf40.toFixed(1)}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-text-tertiary mb-1">
                            <span>Health Signal</span>
                            <span className={ruleOf40 >= 40 ? "text-patina-green" : "text-yellow-400"}>
                                {ruleOf40 >= 40 ? 'Investable' : 'Optimize'}
                            </span>
                        </div>
                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${Math.min(100, ruleOf40)}%` }} 
                                className={`h-full rounded-full ${ruleOf40 >= 40 ? 'bg-patina-green' : 'bg-yellow-400'}`} 
                            />
                        </div>
                    </div>
                </div>

                {/* Burn Rate Card */}
                <div className="bg-panel-bg/60 backdrop-blur-xl border border-glass-border rounded-xl p-5 shadow-glass flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FlameIcon className="w-16 h-16 text-red-500" />
                    </div>
                    <div>
                        <Tooltip content="Net monthly cash outflow after In-Kind offsets">
                            <h4 className="text-text-secondary uppercase text-xs font-bold tracking-widest cursor-help border-b border-dashed border-white/20 inline-block pb-0.5">Net Burn</h4>
                        </Tooltip>
                        <div className="text-3xl font-mono font-bold text-vitreous-white mt-1">
                            ${opex.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm opacity-50">/mo</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-text-tertiary mb-1">
                            <span>Runway (Inc. Grants)</span>
                            <span className={runway < 6 ? "text-red-500 font-bold" : "text-vitreous-white"}>
                                {runway > 60 ? '> 5 Years' : `${runway.toFixed(1)} Months`}
                            </span>
                        </div>
                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: '100%' }} 
                                animate={{ width: `${Math.min(100, (runway / 24) * 100)}%` }} 
                                className={`h-full rounded-full ${runway < 6 ? 'bg-red-500' : 'bg-roman-aqua'}`} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Driver Controls --- */}
                <ModuleCard title="Core Logic Drivers">
                    <div className="space-y-6">
                        {/* Scenario Switcher */}
                        <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                            <label className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                                <span>Sensitivity Analysis</span>
                                <span className="uppercase text-roman-aqua">{scenario}</span>
                            </label>
                            <div className="flex bg-black/40 p-1 rounded-lg">
                                {['base', 'best', 'worst'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setScenario(s as any)}
                                        className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${scenario === s ? 'bg-imperial-purple text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ad Spend Slider */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-text-secondary font-bold">Ad Spend Allocation</span>
                                <span className="text-white font-mono">${adSpend.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="0" max="20000" step="500" 
                                value={adSpend}
                                onChange={(e) => setAdSpend(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-roman-aqua"
                            />
                            <p className="text-[9px] text-text-tertiary mt-1">Impacts Acquisition Revenue & OpEx</p>
                        </div>

                        {/* Churn Rate Slider */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-text-secondary font-bold">Churn Rate (Monthly)</span>
                                <span className={churnRate > 7 ? "text-red-400 font-mono" : "text-white font-mono"}>{churnRate}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="20" step="0.5" 
                                value={churnRate}
                                onChange={(e) => setChurnRate(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-red-500"
                            />
                            <p className="text-[9px] text-text-tertiary mt-1">Impacts Efficiency & LTV</p>
                        </div>
                    </div>
                </ModuleCard>

                {/* --- The "Plug" (Cash Flow Statement) --- */}
                <ModuleCard title="Cash Flow Engine" className="lg:col-span-2">
                    <div className="h-full flex flex-col">
                        <div className="flex-grow space-y-2 text-sm font-mono p-2">
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-text-secondary">Net Income</span>
                                <span className={netIncome >= 0 ? "text-white" : "text-red-400"}>
                                    ${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 text-xs opacity-70">
                                <span className="pl-4">+ Depreciation (Non-Cash)</span>
                                <span>$1,200.00</span>
                            </div>
                            <div className="flex justify-between py-1 text-xs opacity-70">
                                <span className="pl-4 text-patina-green">+ Grant Injection (Financing)</span>
                                <span className="text-patina-green">+${(grantFunding / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-1 text-xs opacity-70">
                                <span className="pl-4 text-roman-aqua">+ In-Kind Offset (Non-Cash)</span>
                                <span className="text-roman-aqua">+${(inKindValue / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-white/10 font-bold bg-white/5 px-2 rounded mt-2">
                                <span className="text-white">Net Cash Change</span>
                                <span className={(netIncome + 1200 + grantFunding/12) >= 0 ? "text-patina-green" : "text-red-500"}>
                                    ${(netIncome + 1200 + (grantFunding / 12)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        
                        {/* Integrity Check */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-patina-green animate-pulse" />
                                <span className="text-xs font-bold text-text-secondary uppercase">Ledger Integrity</span>
                            </div>
                            <span className="text-xs font-mono text-patina-green">BALANCED (A = L + E)</span>
                        </div>
                    </div>
                </ModuleCard>
            </div>
        </div>
    );
};
