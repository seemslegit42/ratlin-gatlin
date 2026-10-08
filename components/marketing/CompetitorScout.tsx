
/**
 * @file components/marketing/CompetitorScout.tsx
 * @description Visualizes competitive landscape using a custom SVG radar chart and
 * displays "intercepted" competitor signals (ads/content).
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { RadarIcon } from '../icons/SecurityIcons';
import { TrendingUpIcon } from '../icons/VitalsIcons';

interface Competitor {
    id: string;
    name: string;
    metrics: {
        voice: number; // Share of Voice
        sentiment: number; // Brand Sentiment
        velocity: number; // Content Velocity
        innovation: number; // New Feature Rate
        spend: number; // Ad Spend Est.
    };
    color: string;
}

const COMPETITORS: Competitor[] = [
    { 
        id: 'us', 
        name: 'OUR SYNDICATE', 
        metrics: { voice: 70, sentiment: 85, velocity: 60, innovation: 90, spend: 50 }, 
        color: '#3EB991' // Patina Green
    },
    { 
        id: 'c1', 
        name: 'Nexus Corp', 
        metrics: { voice: 80, sentiment: 40, velocity: 80, innovation: 30, spend: 90 }, 
        color: '#EF4444' // Red
    },
    { 
        id: 'c2', 
        name: 'Void Systems', 
        metrics: { voice: 40, sentiment: 60, velocity: 40, innovation: 70, spend: 30 }, 
        color: '#6A0DAD' // Imperial Purple
    }
];

const METRIC_KEYS = ['voice', 'sentiment', 'velocity', 'innovation', 'spend'] as const;

// Helper to convert metric value to SVG coordinates
const getCoordinates = (value: number, index: number, total: number, radius: number, center: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
    };
};

const RadarChart: React.FC = () => {
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const totalMetrics = METRIC_KEYS.length;

    // Generate grid levels
    const levels = [0.25, 0.5, 0.75, 1];

    return (
        <div className="relative flex items-center justify-center h-full min-h-[320px]">
            <svg width={size} height={size} className="overflow-visible">
                {/* Grid Background */}
                {levels.map((level, i) => (
                    <polygon
                        key={i}
                        points={METRIC_KEYS.map((_, idx) => {
                            const { x, y } = getCoordinates(100 * level, idx, totalMetrics, radius, center);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {METRIC_KEYS.map((key, i) => {
                    const { x, y } = getCoordinates(110, i, totalMetrics, radius, center);
                    const labelPos = getCoordinates(125, i, totalMetrics, radius, center);
                    return (
                        <g key={key}>
                            <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" />
                            <text 
                                x={labelPos.x} 
                                y={labelPos.y} 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="fill-text-tertiary text-[10px] font-bold uppercase tracking-wider"
                            >
                                {key}
                            </text>
                        </g>
                    );
                })}

                {/* Data Polygons */}
                {COMPETITORS.map((comp) => {
                    const points = METRIC_KEYS.map((key, i) => {
                        const { x, y } = getCoordinates(comp.metrics[key], i, totalMetrics, radius, center);
                        return `${x},${y}`;
                    }).join(' ');

                    return (
                        <motion.polygon
                            key={comp.id}
                            points={points}
                            fill={comp.color}
                            fillOpacity="0.2"
                            stroke={comp.color}
                            strokeWidth="2"
                            initial={{ scale: 0, opacity: 0, transformOrigin: 'center' }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="hover:fill-opacity-40 transition-all"
                        />
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-0 right-0 flex flex-col gap-2 bg-black/60 p-2 rounded-lg border border-white/10">
                {COMPETITORS.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-white font-bold">{c.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CompetitorScout: React.FC = () => {
    const intercepts = [
        { id: 1, source: 'Nexus Corp', type: 'Ad', content: 'Launching Q4 AI suite. Pre-order now.', sentiment: 'Aggressive' },
        { id: 2, source: 'Void Systems', type: 'Social', content: 'Downtime apology. We are scaling servers.', sentiment: 'Weakness' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <ModuleCard title="Market Radar: Share of Voice" className="lg:col-span-2">
                <RadarChart />
            </ModuleCard>

            <ModuleCard title="Signal Intercepts" icon={<RadarIcon className="w-5 h-5 text-red-500" />}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            Live Monitoring
                        </div>
                        <span className="text-[10px] text-text-tertiary font-mono">Scanning...</span>
                    </div>

                    <div className="space-y-3">
                        {intercepts.map(i => (
                            <div key={i.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-white">{i.source}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                        i.sentiment === 'Weakness' ? 'bg-patina-green/20 text-patina-green' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        {i.sentiment}
                                    </span>
                                </div>
                                <p className="text-[10px] text-text-secondary leading-tight mb-2">"{i.content}"</p>
                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-[9px] font-bold text-roman-aqua hover:text-white flex items-center gap-1">
                                        <TrendingUpIcon className="w-3 h-3" /> Counter-Strat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
