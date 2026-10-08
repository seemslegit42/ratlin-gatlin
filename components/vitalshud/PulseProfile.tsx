
/**
 * @file components/vitalshud/PulseProfile.tsx
 * @description Visualizes the user's Flow State and engagement metrics via the Klepsydra Engine.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { KlepsydraMetric } from '../../types';
import { GlassPane } from '../shared/GlassPane';

interface PulseProfileProps {
    klepsydra: KlepsydraMetric;
}

const GRAPH_POINTS = 30; 
const GRAPH_WIDTH = 300; 
const GRAPH_HEIGHT = 80; 

const generatePath = (data: number[], width: number, height: number): string => {
    if (data.length < 2) return `M 0 ${height}`;
    const step = width / (data.length - 1);
    const path = data.map((point, i) => {
        const xCoord = i * step;
        const yValue = point > 1 ? 1 : point < 0 ? 0 : point; // Ensure point is between 0 and 1
        const y = height - (yValue * height); 
        return `${i === 0 ? 'M' : 'L'} ${xCoord.toFixed(2)} ${y.toFixed(2)}`;
    });
    return path.join(' ');
};

const EntropyGraph: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const path = useMemo(() => generatePath(data, GRAPH_WIDTH, GRAPH_HEIGHT), [data]);
    const areaPath = `${path} V ${GRAPH_HEIGHT} L 0 ${GRAPH_HEIGHT} Z`;
    return (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <svg width="100%" height="100%" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} preserveAspectRatio="none" className="opacity-60">
                <defs>
                    <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path d={areaPath} fill="url(#entropyGradient)" animate={{ d: areaPath }} transition={{ duration: 0.2, ease: 'linear' }} />
                <motion.path d={path} fill="none" stroke={color} strokeWidth="2" animate={{ d: path }} transition={{ duration: 0.2, ease: 'linear' }} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
            </svg>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,29,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
        </div>
    );
};

const PulseProfile: React.FC<PulseProfileProps> = ({ klepsydra }) => {
    const [entropyData, setEntropyData] = useState<number[]>(Array(GRAPH_POINTS).fill(0.2));
    const normalizedFlow = Math.max(0, Math.min(100, Number.isFinite(klepsydra.flowScore) ? klepsydra.flowScore : 0));

    useEffect(() => {
        const interval = setInterval(() => {
            const targetEntropy = 1 - (normalizedFlow / 100);
            setEntropyData(current => {
                const previous = current[current.length - 1] ?? targetEntropy;
                const smoothing = klepsydra.state === 'Flow' ? 0.2 : klepsydra.state === 'Boredom' ? 0.3 : 0.38;
                const volatility = klepsydra.state === 'Flow' ? 0.015 : klepsydra.state === 'Boredom' ? 0.03 : 0.045;
                const noise = (Math.random() - 0.5) * volatility;
                const drifted = previous + ((targetEntropy - previous) * smoothing);
                const nextVal = Math.max(0.05, Math.min(0.95, drifted + noise));
                return [...current.slice(1), nextVal];
            });
        }, 1200);
        return () => clearInterval(interval);
    }, [normalizedFlow, klepsydra.state]);

    const entropyColor = klepsydra.state === 'Anxiety' ? '#ef4444' : klepsydra.state === 'Boredom' ? '#facc15' : '#3eb991';

    return (
        <GlassPane 
            variant="default"
            className="min-w-[85vw] md:min-w-0 snap-center md:col-span-3 relative overflow-hidden flex flex-col justify-between min-h-[105px]"
        >
            <div className="absolute inset-0 z-0">
                <EntropyGraph data={entropyData} color={entropyColor} />
            </div>
            <div className="relative z-10 p-2.5 flex justify-between items-start">
                <div>
                    <h3 className="font-comfortaa font-bold text-xs text-vitreous-white/80">PULSE PROFILE</h3>
                    <div className="mt-0.5 flex items-center space-x-1.5">
                        <span className={`text-[8px] font-mono tracking-widest uppercase px-1 py-px rounded border ${klepsydra.state === 'Flow' ? 'text-patina-green border-patina-green/30 bg-patina-green/10' : klepsydra.state === 'Anxiety' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'}`}>
                            {klepsydra.state}
                        </span>
                        {klepsydra.streak > 5 && (
                            <span className="text-[8px] font-mono text-roman-aqua animate-pulse">🔥 {klepsydra.streak}</span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold font-mono leading-none" style={{ color: entropyColor, textShadow: `0 0 8px ${entropyColor}40` }}>
                        {normalizedFlow.toFixed(0)}
                    </div>
                    <div className="text-[8px] text-text-tertiary uppercase tracking-widest mt-0.5">Flow Index</div>
                    <div className="text-[7px] text-text-tertiary uppercase tracking-[0.15em] mt-0.5">
                        {klepsydra.state === 'Anxiety' ? 'Critical' : klepsydra.state === 'Boredom' ? 'Watch' : 'Nominal'}
                    </div>
                </div>
            </div>
        </GlassPane>
    );
};

export default PulseProfile;
