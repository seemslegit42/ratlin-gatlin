
/**
 * @file components/procurement/SpendAnalytics.tsx
 * @description Contains widgets for analyzing procurement spend, tracking contracts, and monitoring savings.
 */

import React, { useState } from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { motion } from 'framer-motion';

export const SpendCategoryChart: React.FC = () => {
    const data = [
        { label: 'Hardware', value: 45, color: '#F97316' }, // Orange-500
        { label: 'Software', value: 30, color: '#EAB308' }, // Yellow-500
        { label: 'Services', value: 25, color: '#3B82F6' }, // Blue-500
    ];
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let currentOffset = 0;

    return (
        <ModuleCard title="Spend by Category">
            <div className="flex items-center justify-around h-full">
                <div className="relative w-40 h-40">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full overflow-visible">
                        <defs>
                            <filter id="glow-spend">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {data.map((item, index) => {
                            const dashArray = `${(item.value / 100) * circumference} ${circumference}`;
                            const dashOffset = -currentOffset;
                            currentOffset += (item.value / 100) * circumference;
                            const isHovered = hoveredIndex === index;
                            
                            return (
                                <circle
                                    key={item.label}
                                    cx="100"
                                    cy="100"
                                    r={radius}
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth={isHovered ? 16 : 12}
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                    filter="url(#glow-spend)"
                                    className="transition-all duration-300 ease-out cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    style={{ opacity: hoveredIndex !== null && !isHovered ? 0.3 : 1 }}
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-vitreous-white font-mono">$1.2M</span>
                        <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Total</span>
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    {data.map((item, index) => (
                        <div 
                            key={item.label} 
                            className={`flex items-center space-x-2 transition-opacity duration-300 ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-30' : 'opacity-100'}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: item.color, backgroundColor: item.color }} />
                            <div>
                                <div className="text-xs font-bold text-vitreous-white">{item.label}</div>
                                <div className="text-[10px] text-text-secondary font-mono">{item.value}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ModuleCard>
    );
};

export const ContractRenewals: React.FC = () => {
    return (
        <ModuleCard title="Contract Renewals">
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-white font-bold group-hover:text-red-400 transition-colors">Cloud Provider A</span>
                    </div>
                    <span className="text-red-400 font-bold font-mono bg-red-500/10 px-2 py-0.5 rounded">15 Days</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5 hover:border-yellow-400/30 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                        <span className="text-white group-hover:text-yellow-300 transition-colors">SaaS License B</span>
                    </div>
                    <span className="text-yellow-400 font-bold font-mono">45 Days</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-patina-green rounded-full" />
                        <span className="text-white">Logistics Co.</span>
                    </div>
                    <span className="text-patina-green font-bold font-mono">120 Days</span>
                </div>
            </div>
        </ModuleCard>
    );
};

export const SavingsTracking: React.FC = () => {
    return (
        <ModuleCard title="Savings Tracking">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-center">
                    <div className="text-4xl font-bold text-patina-green font-mono drop-shadow-[0_0_15px_rgba(62,185,145,0.5)]">
                        $12,450
                    </div>
                    <div className="text-xs text-text-tertiary uppercase tracking-widest mt-1">YTD Cost Avoidance</div>
                </div>
                
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-[10px] text-text-secondary uppercase">
                        <span>Goal Progress</span>
                        <span className="text-patina-green font-mono">83%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '83%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-patina-green to-emerald-600 rounded-full shadow-[0_0_10px_rgba(62,185,145,0.5)]" 
                        />
                    </div>
                </div>
            </div>
        </ModuleCard>
    );
};
