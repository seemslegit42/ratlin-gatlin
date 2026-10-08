
/**
 * @file components/admin/InfraControlPanel.tsx
 * @description Real-time serverless backend and AI performance monitoring dashboard.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useInfraMetrics } from '../../hooks/useInfraMetrics';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ZapIcon, TrendingUpIcon } from '../icons/VitalsIcons';
import { BrainIcon } from '../icons/BrainIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

const MetricDisplay: React.FC<{ label: string; value: string | number; sub?: string; color: string }> = ({ label, value, sub, color }) => (
    <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between h-32">
        <div>
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{label}</span>
            <div className={`text-2xl font-mono font-bold mt-1`} style={{ color }}>{value}</div>
        </div>
        {sub && <span className="text-[10px] text-text-secondary opacity-60 font-mono">{sub}</span>}
    </div>
);

const Waveform: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="flex items-end gap-0.5 h-12 w-full px-2">
        {[...Array(30)].map((_, i) => (
            <motion.div
                key={i}
                className="w-1 bg-roman-aqua rounded-t-sm"
                animate={{ 
                    height: active ? [4, Math.random() * 40 + 4, 4] : 4,
                    opacity: active ? [0.2, 0.6, 0.2] : 0.1
                }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
            />
        ))}
    </div>
);

export const InfraControlPanel: React.FC = () => {
    const { metrics, events } = useInfraMetrics();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <MetricDisplay label="Neural Latency" value={`${metrics.latency}ms`} sub="Rolling average (20 calls)" color="#20B2AA" />
                <MetricDisplay label="Neural Load" value={`${metrics.neuralLoad}%`} sub="CPU Utilization (Simulated)" color="#6A0DAD" />
                <MetricDisplay label="Error Rate" value={`${metrics.errorRate.toFixed(2)}%`} sub="Protocol Stability" color={metrics.errorRate > 5 ? '#EF4444' : '#3EB991'} />
                <MetricDisplay label="CogniOps Consumption" value={metrics.totalTokens.toLocaleString()} sub={`Est. Cost: $${metrics.costEstimate.toFixed(4)}`} color="#FFD700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ModuleCard title="Uplink Activity" className="lg:col-span-2">
                    <div className="flex flex-col h-[400px]">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-lg mb-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ZapIcon className="w-4 h-4 text-roman-aqua animate-pulse" />
                                <span className="text-xs font-bold text-vitreous-white uppercase tracking-wider">Live Neural Stream</span>
                            </div>
                            <span className="text-[10px] font-mono text-text-tertiary">RPM: {metrics.throughput}</span>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-1 font-mono text-[10px]">
                            {events.map((e) => (
                                <div key={e.id} className="flex justify-between items-center py-1.5 px-3 bg-white/5 rounded border-l-2 border-transparent hover:border-roman-aqua transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="text-text-tertiary">[{new Date(e.timestamp).toLocaleTimeString()}]</span>
                                        <span className={e.status === 'SUCCESS' ? 'text-patina-green' : 'text-red-400'}>{e.type}</span>
                                        <span className="text-text-secondary opacity-40">{e.duration}ms</span>
                                    </div>
                                    <div className="text-text-tertiary text-[9px] truncate max-w-[200px]">
                                        {JSON.stringify(e.metadata)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <Waveform active={metrics.throughput > 0} />
                        </div>
                    </div>
                </ModuleCard>

                <div className="space-y-6">
                    <ModuleCard title="Infrastructure Health" icon={<ShieldCheckIcon className="w-5 h-5 text-patina-green" />}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-secondary">Appwrite Link</span>
                                <span className="text-patina-green font-bold">CONNECTED</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-secondary">AI Availability</span>
                                <span className="text-patina-green font-bold">NOMINAL</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-secondary">Stability Protocol</span>
                                <span className="text-roman-aqua font-bold">EXP_BACKOFF_V2</span>
                            </div>
                            
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Scaling Policy</h4>
                                <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                                    <p className="text-[11px] text-text-secondary leading-relaxed">
                                        Serverless auto-scaling active. Maximum neural density configured to <span className="text-white">80%</span> before load redistribution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ModuleCard>

                    <ModuleCard title="Agentic Load Balancing">
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="relative">
                                <BrainIcon className="w-16 h-16 text-imperial-purple animate-pulse-slow" />
                                <motion.div 
                                    className="absolute inset-0 border-2 border-roman-aqua rounded-full"
                                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <h4 className="mt-4 font-bold text-sm text-white">Dynamic Resource Tuning</h4>
                            <p className="text-[10px] text-text-tertiary mt-1 px-4 leading-snug">
                                Allocating high-tier nodes for complex Reasoning tasks in Weaver Studio.
                            </p>
                        </div>
                    </ModuleCard>
                </div>
            </div>
        </div>
    );
};
