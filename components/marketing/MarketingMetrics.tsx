
/**
 * @file components/marketing/MarketingMetrics.tsx
 * @description Displays key performance indicators for the Marketing module with trend visualization.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { TrendingUpIcon, ZapIcon } from '../icons/VitalsIcons';
import { ChartBarIcon } from '../icons/EconomyIcons';
import { motion } from 'framer-motion';

// Exported for usage in other diagnostic components like The Pantheon
export const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 40;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <motion.polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <circle cx={(data.length - 1) * (width / (data.length - 1))} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={color} className="animate-pulse" />
        </svg>
    );
};

export const MarketingMetrics: React.FC = () => {
    const reachData = [2.1, 2.2, 2.15, 2.3, 2.35, 2.4];
    const engData = [4.8, 5.0, 5.2, 4.9, 5.5, 5.8];
    const convData = [2.5, 2.6, 2.8, 2.9, 3.0, 3.1];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModuleCard title="Total Reach" icon={<TrendingUpIcon className="w-6 h-6 text-purple-400"/>}>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-end space-x-2">
                            <span className="text-4xl font-bold text-vitreous-white">2.4M</span>
                            <span className="text-sm text-patina-green mb-1 font-mono">+12%</span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-1">Unique Impressions (30d)</p>
                    </div>
                    <div className="mb-1 opacity-80">
                        <Sparkline data={reachData} color="#A855F7" />
                    </div>
                </div>
            </ModuleCard>

            <ModuleCard title="Avg. Engagement" icon={<ZapIcon className="w-6 h-6 text-yellow-400"/>}>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-end space-x-2">
                            <span className="text-4xl font-bold text-vitreous-white">5.8%</span>
                            <span className="text-sm text-patina-green mb-1 font-mono">↑ 1.6%</span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-1">Cross-Platform Interaction</p>
                    </div>
                    <div className="mb-1 opacity-80">
                        <Sparkline data={engData} color="#FACC15" />
                    </div>
                </div>
            </ModuleCard>

            <ModuleCard title="Conversion Rate" icon={<ChartBarIcon className="w-6 h-6 text-pink-500"/>}>
                 <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-end space-x-2">
                            <span className="text-4xl font-bold text-vitreous-white">3.1%</span>
                            <span className="text-sm text-patina-green mb-1 font-mono">Target: 3.0%</span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-1">Lead-to-Opportunity</p>
                    </div>
                    <div className="mb-1 opacity-80">
                        <Sparkline data={convData} color="#EC4899" />
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
