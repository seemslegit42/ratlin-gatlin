
/**
 * @file components/production/SupplyChainVisualizer.tsx
 * @description A graphical representation of the supply chain network with animated flows.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { motion } from 'framer-motion';

export const SupplyChainVisualizer: React.FC = () => {
    return (
        <ModuleCard title="Supply Chain Nexus" className="lg:col-span-2">
            <div className="h-64 bg-black/40 rounded-lg relative overflow-hidden border border-white/5">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#3EB991_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
                
                {/* Node: Suppliers (West) */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse" />
                    <span className="text-[10px] text-text-tertiary mt-2 uppercase tracking-wider">Raw Material</span>
                </div>

                {/* Node: Manufacturing (Center) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-white flex items-center justify-center">
                        <span className="text-white font-bold text-xs">MFG</span>
                    </div>
                    <span className="text-[10px] text-text-tertiary mt-2 uppercase tracking-wider">Production</span>
                </div>

                {/* Node: Distribution (East) */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-4 h-4 bg-roman-aqua rounded-full shadow-[0_0_15px_rgba(32,178,170,0.8)]" />
                    <span className="text-[10px] text-text-tertiary mt-2 uppercase tracking-wider">Logistics</span>
                </div>

                {/* Connection Lines & Flow Particles */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Line 1: Supplier -> MFG */}
                    <line x1="10%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <motion.circle r="3" fill="#ffffff"
                        animate={{ cx: ["10%", "50%"], cy: ["50%", "50%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Line 2: MFG -> Distro */}
                    <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <motion.circle r="3" fill="#20B2AA"
                        animate={{ cx: ["50%", "90%"], cy: ["50%", "50%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "linear" }}
                    />
                </svg>
                
                {/* Status Overlay */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-emerald-400 font-mono border border-emerald-500/30">
                    FLOW: OPTIMAL
                </div>
            </div>
        </ModuleCard>
    );
};
