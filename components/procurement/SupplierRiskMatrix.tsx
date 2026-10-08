
import React, { useState } from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { LayersIcon } from '../icons/LayersIcon';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from '../shared/Tooltip'; // Reusing the shared Tooltip component

interface Supplier {
    id: string;
    name: string;
    risk: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    onTimeDelivery: number; // percentage
    qualityScore: number; // percentage
    dependencies: string[]; // e.g., "GPU Cluster", "Logistics Agent"
    position?: { x: number; y: number }; // Relative position in chart (0-100)
}

const SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Acme Silicon', risk: 'low', impact: 'high', onTimeDelivery: 98, qualityScore: 95, dependencies: ['Cognitive Core', 'Weaver Studio'] },
    { id: 'sup-2', name: 'Global Logistics', risk: 'medium', impact: 'high', onTimeDelivery: 85, qualityScore: 90, dependencies: ['Production: CNC Line A', 'Operations: Dispatch'] },
    { id: 'sup-3', name: 'Neural Fabric Inc.', risk: 'low', impact: 'low', onTimeDelivery: 99, qualityScore: 98, dependencies: ['HRM: Onboarding Agent'] },
    { id: 'sup-4', name: 'Quantum Cloud Solutions', risk: 'high', impact: 'high', onTimeDelivery: 70, qualityScore: 80, dependencies: ['All Modules', 'Data Storage'] },
    { id: 'sup-5', name: 'SensorNet Supply', risk: 'medium', impact: 'low', onTimeDelivery: 92, qualityScore: 88, dependencies: ['Security: Sentinel Grid'] },
];

const RISK_MAP = {
    'low': 20,
    'medium': 50,
    'high': 80,
};

const IMPACT_MAP = {
    'low': 20,
    'medium': 50,
    'high': 80,
};

const getColorForRisk = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
        case 'low': return 'bg-patina-green shadow-[0_0_10px_rgba(62,185,145,0.5)]';
        case 'medium': return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
        case 'high': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        default: return 'bg-white/50';
    }
};

export const SupplierRiskMatrix: React.FC = () => {
    // Pre-calculate positions once
    const suppliersWithPositions = SUPPLIERS.map(s => ({
        ...s,
        position: {
            x: RISK_MAP[s.risk] + (Math.random() * 10 - 5), // Add slight random offset for spread
            y: 100 - IMPACT_MAP[s.impact] + (Math.random() * 10 - 5) // Invert Y-axis for High Impact at top
        }
    }));

    return (
        <ModuleCard title="Supplier Risk Analysis" icon={<LayersIcon className="w-5 h-5 text-red-400" />}>
            <div className="flex flex-col h-full space-y-6">
                {/* Quadrant Chart */}
                <div className="relative flex-grow min-h-[250px] bg-black/30 rounded-lg overflow-hidden border border-white/5">
                    {/* Background Quadrants */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 text-white/50 text-[10px] font-mono uppercase">
                        <div className="border-r border-b border-white/10 p-2 flex flex-col justify-between">
                            <span className="text-right opacity-30">Low Impact</span>
                            <span className="opacity-30">Low Risk</span>
                        </div>
                        <div className="border-b border-white/10 p-2 flex flex-col justify-between">
                            <span className="text-right opacity-80">High Impact</span>
                            <span className="opacity-30">Low Risk</span>
                        </div>
                        <div className="border-r border-white/10 p-2 flex flex-col justify-between">
                            <span className="text-right opacity-30">Low Impact</span>
                            <span className="opacity-80">High Risk</span>
                        </div>
                        <div className="p-2 flex flex-col justify-between">
                            <span className="text-right opacity-80">High Impact</span>
                            <span className="opacity-80">High Risk</span>
                        </div>
                    </div>

                    {/* Supplier Dots */}
                    {suppliersWithPositions.map(s => (
                        // Fix: Tooltip content now accepts React.ReactNode
                        <Tooltip
                            key={s.id}
                            content={
                                <div className="text-xs">
                                    <p>On-time: <span className="font-bold text-patina-green">{s.onTimeDelivery}%</span></p>
                                    <p>Quality: <span className="font-bold text-roman-aqua">{s.qualityScore}%</span></p>
                                </div>
                            }
                        >
                            <motion.div
                                className={`absolute w-3 h-3 rounded-full transition-all duration-300 cursor-help ${getColorForRisk(s.risk)}`}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 2, zIndex: 10 }}
                                style={{
                                    left: `calc(${s.position!.x}% - 6px)`,
                                    top: `calc(${s.position!.y}% - 6px)`,
                                }}
                                title={s.name}
                            />
                        </Tooltip>
                    ))}

                    {/* Axis Labels */}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-text-tertiary uppercase font-mono">Risk →</span>
                    <span className="absolute left-1 top-1/2 -rotate-90 origin-bottom-left text-[9px] text-text-tertiary uppercase font-mono">Impact →</span>

                </div>

                {/* Key Dependencies */}
                <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Key Dependencies</h4>
                    <div className="space-y-3 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                        {suppliersWithPositions.map(s => (
                            <div key={s.id} className="flex items-center text-sm">
                                <span className="font-bold text-vitreous-white min-w-[120px]">{s.name}:</span>
                                <div className="flex flex-wrap gap-2 flex-grow">
                                    {s.dependencies.map((dep, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-text-tertiary font-mono">
                                            {dep}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModuleCard>
    );
};
