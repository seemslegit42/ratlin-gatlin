
/**
 * @file components/economy/MetronomeWave.tsx
 * @description Real-time visualization of the Sine-Rhythm Engine (SRE).
 * Displays the current 'Complexity' multiplier as a dynamic wave.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SREParams } from '../../types';

interface MetronomeWaveProps {
  params: SREParams;
  height?: number;
}

export const MetronomeWave: React.FC<MetronomeWaveProps> = ({ params, height = 120 }) => {
    const [time, setTime] = useState(Date.now() / 1000);
    const points = 100;
    const width = 800;

    useEffect(() => {
        const frame = requestAnimationFrame(function update() {
            setTime(Date.now() / 1000);
            requestAnimationFrame(update);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    const pathData = useMemo(() => {
        const { A, f, phi, baseComplexity } = params;
        const coords = [];
        for (let i = 0; i <= points; i++) {
            const x = (i / points) * width;
            const tOffset = (i / points) * 10; // Show 10s of future/past
            const currentT = time - tOffset;
            const val = baseComplexity + A * Math.sin(2 * Math.PI * f * currentT + phi);
            
            // Map val (approx 0.8 to 1.2) to height
            const y = height / 2 - ((val - baseComplexity) / A) * (height / 3);
            coords.push(`${x},${y}`);
        }
        return `M ${coords.join(' L ')}`;
    }, [params, time, height]);

    const currentVal = params.baseComplexity + params.A * Math.sin(2 * Math.PI * params.f * time + params.phi);

    return (
        <div className="relative w-full overflow-hidden bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-center h-48">
            <div className="absolute top-3 left-4 flex items-center gap-3">
                <span className="text-[10px] font-black text-roman-aqua uppercase tracking-[0.3em]">Complexity Wave (SRE)</span>
                <div className="w-1.5 h-1.5 rounded-full bg-roman-aqua animate-pulse" />
            </div>

            <div className="absolute top-3 right-4 text-right">
                <span className="text-[8px] font-bold text-text-tertiary uppercase block">Multiplier</span>
                <span className="text-xl font-mono font-bold text-white">{currentVal.toFixed(4)}x</span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible opacity-80">
                <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6A0DAD" />
                        <stop offset="50%" stopColor="#20B2AA" />
                        <stop offset="100%" stopColor="#3EB991" />
                    </linearGradient>
                </defs>
                
                {/* Horizontal Baseline */}
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                
                {/* The Wave */}
                <path d={pathData} fill="none" stroke="url(#waveGrad)" strokeWidth="3" strokeLinecap="round" />
                
                {/* Current Point Indicator */}
                <circle cx="0" cy={height / 2 - ((currentVal - params.baseComplexity) / params.A) * (height / 3)} r="4" fill="white" className="shadow-[0_0_10px_white]" />
            </svg>
            
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[8px] font-mono text-text-tertiary uppercase">
                <span>T-Minus 10s</span>
                <span className="text-patina-green">Protocol Alpha: ACTIVE</span>
                <span>Neural Present</span>
            </div>
        </div>
    );
};
