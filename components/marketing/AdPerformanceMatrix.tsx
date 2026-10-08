
/**
 * @file components/marketing/AdPerformanceMatrix.tsx
 * @description A high-fidelity diagnostic matrix for multi-channel ad performance.
 * Visualizes the "Synaptic Link" between spend and conversion.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { TrendingUpIcon, ZapIcon } from '../icons/VitalsIcons';
import { ChartBarIcon, CoinsIcon } from '../icons/EconomyIcons';

interface ChannelMetrics {
    channel: string;
    spend: number;
    clicks: number;
    conversions: number;
    cpa: number;
    roas: number;
    ctr: number;
    color: string;
    status: 'OPTIMAL' | 'DEGRADED' | 'HEALING';
}

const PERFORMANCE_DATA: ChannelMetrics[] = [
    { channel: 'Google Search', spend: 18200, clicks: 12400, conversions: 850, cpa: 21.41, roas: 5.2, ctr: 3.4, color: '#4285F4', status: 'OPTIMAL' },
    { channel: 'Meta Social', spend: 14500, clicks: 45200, conversions: 620, cpa: 23.38, roas: 3.8, ctr: 1.2, color: '#0668E1', status: 'HEALING' },
    { channel: 'LinkedIn B2B', spend: 6800, clicks: 2100, conversions: 45, cpa: 151.11, roas: 2.4, ctr: 0.8, color: '#0077B5', status: 'DEGRADED' },
    { channel: 'TikTok Buzz', spend: 3000, clicks: 55800, conversions: 120, cpa: 25.00, roas: 4.1, ctr: 2.1, color: '#EE1D52', status: 'OPTIMAL' },
];

const MetricHeartbeat: React.FC<{ color: string }> = ({ color }) => (
    <div className="flex items-center space-x-1">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ backgroundColor: color }}
                animate={{ height: [4, 12, 4], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
        ))}
    </div>
);

export const AdPerformanceMatrix: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {PERFORMANCE_DATA.map((data) => (
                    <div key={data.channel} className="bg-black/40 border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle at top right, ${data.color}, transparent)` }} />
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h4 className="text-xs font-bold text-vitreous-white uppercase tracking-widest">{data.channel}</h4>
                                <span className={`text-[9px] font-mono ${data.status === 'OPTIMAL' ? 'text-patina-green' : data.status === 'HEALING' ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {data.status}
                                </span>
                            </div>
                            <MetricHeartbeat color={data.color} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <div className="text-[10px] text-text-tertiary uppercase">ROAS</div>
                                <div className="text-xl font-mono font-bold text-white">{data.roas}x</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-text-tertiary uppercase">CPA</div>
                                <div className="text-xl font-mono font-bold text-white">${data.cpa}</div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 relative z-10">
                            <div className="text-center">
                                <div className="text-[8px] text-text-tertiary uppercase">Clicks</div>
                                <div className="text-xs font-mono text-text-secondary">{(data.clicks / 1000).toFixed(1)}k</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] text-text-tertiary uppercase">Conv.</div>
                                <div className="text-xs font-mono text-text-secondary">{data.conversions}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] text-text-tertiary uppercase">CTR</div>
                                <div className="text-xs font-mono text-text-secondary">{data.ctr}%</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ModuleCard title="Synaptic Attribution Map">
                <div className="h-64 bg-black/30 rounded-lg border border-white/5 relative flex items-center justify-center overflow-hidden">
                    {/* Abstract Visualization of Multi-Touch Attribution */}
                    <svg className="absolute inset-0 w-full h-full opacity-40">
                        {PERFORMANCE_DATA.map((d, i) => (
                            <motion.path
                                key={i}
                                d={`M ${100 + i * 200},300 C ${100 + i * 200},150 400,150 400,50`}
                                fill="none"
                                stroke={d.color}
                                strokeWidth={d.roas}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: i * 0.3 }}
                            />
                        ))}
                    </svg>
                    <div className="relative z-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-2 mx-auto backdrop-blur-md shadow-2xl">
                            <CoinsIcon className="w-8 h-8 text-patina-green" />
                        </div>
                        <p className="text-xs font-mono text-text-secondary uppercase tracking-[0.2em]">Sovereign Yield Apex</p>
                    </div>
                    
                    {/* Floating Info Pods */}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded border border-white/10 text-[10px] text-text-tertiary">
                        <span className="text-white font-bold">Heuristic:</span> Time-Decay Attribution Active
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
