import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ZapIcon } from '../../components/icons/VitalsIcons';
import type { CRMContact, CRMDeal } from '../../types';

interface StrategicInfluenceHeatmapProps {
    contacts: CRMContact[];
    pipeline: Record<string, CRMDeal[]>;
}

export const StrategicInfluenceHeatmap: React.FC<StrategicInfluenceHeatmapProps> = ({ contacts, pipeline }) => {
    // Generate a 5x5 heatmap grid
    // X-axis: Relationship Resonance (simulated)
    // Y-axis: Potential Value (simulated)
    
    const allDeals = Object.values(pipeline).flat() as CRMDeal[];
    
    const getCellIntensity = (x: number, y: number) => {
        // Simple logic to determine if a cell has "entities"
        const resonanceRange = [x * 20, (x + 1) * 20];
        const valueRange = [y * 200000, (y + 1) * 200000];
        
        const count = allDeals.filter(d => 
            (d.resonance || 0) >= resonanceRange[0] && 
            (d.resonance || 0) < resonanceRange[1] &&
            d.value >= valueRange[0] &&
            d.value < valueRange[1]
        ).length;
        
        return Math.min(count, 5) / 5; // Normalize to 0-1
    };

    return (
        <ModuleCard title="Strategic Influence Heatmap" icon={<ZapIcon className="w-5 h-5 text-patina-green" />}>
            <div className="space-y-4">
                <div className="relative aspect-square w-full bg-black/40 rounded-xl border border-white/5 p-2 grid grid-cols-5 grid-rows-5 gap-1">
                    {[...Array(25)].map((_, i) => {
                        const x = i % 5;
                        const y = 4 - Math.floor(i / 5);
                        const intensity = getCellIntensity(x, y);
                        
                        return (
                            <motion.div 
                                key={i}
                                className="rounded-sm relative group cursor-crosshair"
                                style={{ 
                                    backgroundColor: `rgba(62, 185, 145, ${0.05 + intensity * 0.8})`,
                                    border: intensity > 0 ? '1px solid rgba(62, 185, 145, 0.3)' : '1px solid rgba(255,255,255,0.02)'
                                }}
                                whileHover={{ scale: 1.05, zIndex: 10, borderColor: 'rgba(62, 185, 145, 1)' }}
                            >
                                {intensity > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                    </div>
                                )}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                    Resonance: {x*20}-{(x+1)*20}% | Value: ${(y*200).toFixed(0)}k+
                                </div>
                            </motion.div>
                        );
                    })}
                    
                    {/* Axis Labels */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] text-text-tertiary uppercase tracking-widest font-bold">Value Density</div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-text-tertiary uppercase tracking-widest font-bold">Resonance Index</div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-patina-green shadow-[0_0_8px_rgba(62,185,145,1)]" />
                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">High Probability Zone</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-tertiary">Optimal Vector: Top-Right</span>
                </div>
            </div>
        </ModuleCard>
    );
};
