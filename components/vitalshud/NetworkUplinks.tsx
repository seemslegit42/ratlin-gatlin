
/**
 * @file components/vitalshud/NetworkUplinks.tsx
 * @description Visualizes network connectivity statuses for various subsystems.
 */

import React, { useMemo } from 'react';
import { WifiIcon } from '../icons/WifiIcon';
import { BrainIcon } from '../icons/BrainIcon';

const LinkNode: React.FC<{ label: string; icon: React.ReactNode; color: string; isActive: boolean; latency: number; statusLabel: string }> = ({ label, icon, color, isActive, latency, statusLabel }) => (
    <div className="flex items-center justify-between px-1.5 py-1 rounded bg-white/5 border border-white/5 hover:border-glass-border transition-all group backdrop-blur-sm">
        <div className="flex items-center space-x-1.5 overflow-hidden">
            <div className={`p-1 rounded-full bg-black/40 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`} style={{ color: isActive ? color : '#718096' }}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[9px] font-bold text-vitreous-white group-hover:text-white transition-colors truncate">{label}</div>
                <div className="flex items-center space-x-0.5">
                    <div className={`w-1 h-1 rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: isActive ? color : '#718096' }}></div>
                    <span className="text-[7px] font-mono text-text-tertiary hidden xl:inline">{statusLabel}</span>
                </div>
            </div>
        </div>
        <div className="text-right flex-shrink-0 pl-0.5">
            <div className="font-mono text-[9px] text-roman-aqua">{latency}ms</div>
        </div>
    </div>
);

interface NetworkUplinksProps {
    hasEconomyFeed?: boolean;
    /** Agent coherence (0–100); drives NEURAL lane independently of treasury feed. */
    coherencePercent?: number;
}

const NetworkUplinks: React.FC<NetworkUplinksProps> = ({ hasEconomyFeed = true, coherencePercent = 100 }) => {
    const netLatency = hasEconomyFeed ? 12 : 48;
    const neuralLatency = coherencePercent >= 35 ? 45 : 92;

    const netStatus = useMemo(() => {
        if (!hasEconomyFeed) return 'DEGRADED';
        if (netLatency > 40) return 'DEGRADED';
        return 'CONNECTED';
    }, [hasEconomyFeed, netLatency]);

    const neuralStatus = useMemo(() => {
        const health = Number.isFinite(coherencePercent) ? coherencePercent : 100;
        if (health < 35) return 'DEGRADED';
        if (neuralLatency > 85) return 'DEGRADED';
        return 'CONNECTED';
    }, [coherencePercent, neuralLatency]);

    return (
        <div className="min-w-[50vw] md:min-w-0 snap-center md:col-span-2 flex flex-col space-y-1.5 justify-center h-full">
            <LinkNode 
                label="MAINNET" 
                icon={<WifiIcon className="w-2.5 h-2.5"/>} 
                color="#20B2AA" 
                isActive={netStatus === 'CONNECTED'} 
                latency={netLatency} 
                statusLabel={netStatus}
            />
            <LinkNode 
                label="NEURAL" 
                icon={<BrainIcon className="w-2.5 h-2.5"/>} 
                color="#6A0DAD" 
                isActive={neuralStatus === 'CONNECTED'} 
                latency={neuralLatency} 
                statusLabel={neuralStatus}
            />
        </div>
    );
};

export default NetworkUplinks;
