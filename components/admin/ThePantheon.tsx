/**
 * @file components/admin/ThePantheon.tsx
 * @description The "Pantheon" - A living star-chart visualization where each star represents a Soul (User).
 * Souls are clustered into Constellations (Syndicates) based on gravitational influence (Wealth/Activity).
 * Visuals enhanced for "Deep Space" aesthetic.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Soul } from '../../types';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { Sparkline } from '../marketing/MarketingMetrics'; 
import { BrainIcon } from '../icons/BrainIcon';
import { ZapIcon } from '../icons/VitalsIcons';
import { CrownIcon } from '../icons/CrownIcon';

interface SyndicateNode {
    id: string;
    name: string;
    wealth: number;
    pos: { x: number; y: number };
    souls: Soul[];
    color: string;
}

// --- MOCK DATA GENERATOR ---
const SYNDICATE_DATA = [
    { name: 'Aetherius', color: '#6A0DAD' },
    { name: 'Void-Runners', color: '#20B2AA' },
    { name: 'Neon-Nexus', color: '#FFD700' },
    { name: 'Iron-Phalanx', color: '#EF4444' },
    { name: 'Solar-Cult', color: '#F97316' }
];

const generateConsortium = (): SyndicateNode[] => {
    return SYNDICATE_DATA.map((syn, idx) => {
        const syndicateId = `syn-${idx}`;
        const wealth = Math.random() * 5000 + 1000;
        
        // Distribute in a rough circle but with organic offset
        const angle = (idx / SYNDICATE_DATA.length) * Math.PI * 2;
        const radius = 25 + Math.random() * 15; // 25-40% from center
        const centerPos = {
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle)
        };

        const soulCount = Math.floor(Math.random() * 6) + 3;
        const souls: Soul[] = Array.from({ length: soulCount }).map((_, sIdx) => ({
            id: `${syndicateId}-soul-${sIdx}`,
            name: `Initiate ${idx}-${sIdx}`,
            covenant: Math.random() > 0.6 ? 'motion' : 'silence',
            tributeVelocity: Math.random() * 100,
            // Fix: Added missing lastAgentFsCall property to psycheMatrix to match Soul type definition
            psycheMatrix: {
                frustration: Math.random() * 100,
                engagement: Math.random() * 100,
                anxiety: Math.random() * 100,
                lastAgentFsCall: Date.now() - Math.floor(Math.random() * 3600000)
            },
            coordinates: {
                // Cluster around the syndicate center
                x: centerPos.x + (Math.random() * 14 - 7),
                y: centerPos.y + (Math.random() * 14 - 7)
            },
            status: Math.random() > 0.95 ? 'alert' : 'active'
        }));

        return { id: syndicateId, name: syn.name, wealth, pos: centerPos, souls, color: syn.color };
    });
};

/**
 * Renders an individual Soul as a distinct star glyph.
 */
const StarGlyph: React.FC<{ 
    soul: Soul; 
    color: string; 
    onClick: (soul: Soul) => void;
    isSelected: boolean;
    isDimmed: boolean;
}> = ({ soul, color, onClick, isSelected, isDimmed }) => {
    const isMotion = soul.covenant === 'motion';
    const size = 6 + (soul.tributeVelocity / 20); // Base size
    
    // Motion: Diamond Flare / Silence: Ringed Orb
    const scaleVariant = isSelected ? 1.5 : 1;
    
    return (
        <motion.div
            className="absolute z-20 cursor-pointer"
            style={{
                left: `${soul.coordinates.x}%`,
                top: `${soul.coordinates.y}%`,
                width: size,
                height: size,
                x: '-50%',
                y: '-50%'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: scaleVariant, 
                opacity: isDimmed ? 0.2 : 1,
                filter: isSelected ? `drop-shadow(0 0 10px ${color})` : 'none'
            }}
            whileHover={{ scale: 1.8, zIndex: 50 }}
            onClick={(e) => { e.stopPropagation(); onClick(soul); }}
        >
            {/* The Star Shape */}
            <div className="relative w-full h-full flex items-center justify-center">
                {isMotion ? (
                    // Motion: 4-Point Flare
                    <>
                        <motion.div 
                            className="absolute w-[20%] h-[120%] bg-white rounded-full"
                            style={{ backgroundColor: color }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                        />
                        <motion.div 
                            className="absolute w-[120%] h-[20%] bg-white rounded-full"
                            style={{ backgroundColor: color }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                        />
                        <div className="absolute w-[40%] h-[40%] bg-white rounded-full shadow-[0_0_10px_white]" />
                    </>
                ) : (
                    // Silence: Orb with Halo
                    <>
                        <div 
                            className="absolute inset-0 rounded-full border border-white/50" 
                            style={{ borderColor: color }}
                        />
                        <motion.div 
                            className="w-[60%] h-[60%] rounded-full bg-white shadow-[0_0_10px_currentColor]"
                            style={{ color }}
                            animate={{ scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() }}
                        />
                    </>
                )}
                
                {/* Alert Indicator */}
                {soul.status === 'alert' && (
                    <motion.div 
                        className="absolute -inset-2 border border-red-500 rounded-full"
                        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Label on Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <span className="text-[8px] font-mono font-bold text-white bg-black/80 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                    {soul.name}
                </span>
            </div>
        </motion.div>
    );
};

const SoulCard: React.FC<{ soul: Soul; onClose: () => void }> = ({ soul, onClose }) => {
    // Generate some mock history for the sparkline
    const frustrationData = useMemo(() => Array.from({ length: 10 }).map(() => Math.random() * 100), []);
    const engagementData = useMemo(() => Array.from({ length: 10 }).map(() => Math.random() * 100), []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 bottom-4 w-80 z-50 pointer-events-auto"
        >
            <ModuleCard 
                title={soul.name} 
                className="h-full bg-obsidian-black/95 backdrop-blur-3xl border-l-2"
                style={{ borderLeftColor: soul.covenant === 'motion' ? '#FFD700' : '#20B2AA' }}
                action={<button onClick={onClose} className="text-text-tertiary hover:text-white transition-colors">✕</button>}
            >
                <div className="flex flex-col h-full">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                            <div className="text-[9px] uppercase text-text-tertiary font-bold mb-1 tracking-widest">Covenant</div>
                            <div className={`text-xs font-bold uppercase ${soul.covenant === 'motion' ? 'text-yellow-400' : 'text-roman-aqua'}`}>
                                {soul.covenant}
                            </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                            <div className="text-[9px] uppercase text-text-tertiary font-bold mb-1 tracking-widest">Velocity</div>
                            <div className="text-xs font-mono font-bold text-patina-green">
                                {soul.tributeVelocity.toFixed(1)} $\Xi$/h
                            </div>
                        </div>
                    </div>

                    {/* Psyche Analysis */}
                    <div className="space-y-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Engagement Pulse</h4>
                                <span className="text-[10px] font-mono text-patina-green">{soul.psycheMatrix.engagement.toFixed(0)}%</span>
                            </div>
                            <div className="bg-black/40 p-2 rounded-lg border border-white/5 mb-2">
                                <Sparkline data={engagementData} color="#3EB991" />
                            </div>
                            <p className="text-[10px] text-text-tertiary leading-relaxed italic">
                                "Subject shows high resonance with automation protocols."
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Frustration Drag</h4>
                                <span className="text-[10px] font-mono text-red-400">{soul.psycheMatrix.frustration.toFixed(0)}%</span>
                            </div>
                            <div className="bg-black/40 p-2 rounded-lg border border-white/5 mb-2">
                                <Sparkline data={frustrationData} color="#EF4444" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Architect Interventions</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="w-full py-2 bg-patina-green/10 hover:bg-patina-green/30 border border-patina-green/30 rounded text-[10px] font-bold text-patina-green uppercase transition-all flex items-center justify-center gap-2">
                                    <ZapIcon className="w-3 h-3" /> Bestow Digital Bounty
                                </button>
                                <button className="w-full py-2 bg-imperial-purple/10 hover:bg-imperial-purple/30 border border-imperial-purple/30 rounded text-[10px] font-bold text-imperial-purple uppercase transition-all flex items-center justify-center gap-2">
                                    <BrainIcon className="w-3 h-3" /> Adjust Neural Bias
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ModuleCard>
        </motion.div>
    );
};

const ThePantheon: React.FC = () => {
    const consortium = useMemo(() => generateConsortium(), []);
    const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);
    const [hoveredSyn, setHoveredSyn] = useState<string | null>(null);

    return (
        <div className="relative w-full h-[700px] bg-[#050508] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/pantheon select-none">
            {/* 1. Deep Space Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#12121A_0%,_#000_100%)] pointer-events-none" />
            
            {/* 2. Starfield Layers */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(white 0.5px, transparent 0.5px)', backgroundSize: '60px 60px' }} />
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '120px 120px' }} />

            {/* 3. Nebula & Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
                <defs>
                    <filter id="syn-glow">
                        <feGaussianBlur stdDeviation="30" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    {consortium.map(syn => (
                        <radialGradient key={`grad-${syn.id}`} id={`grad-${syn.id}`}>
                            <stop offset="0%" stopColor={syn.color} stopOpacity="0.15" />
                            <stop offset="70%" stopColor={syn.color} stopOpacity="0" />
                        </radialGradient>
                    ))}
                </defs>

                {consortium.map(syn => {
                    const isHovered = hoveredSyn === syn.id;
                    const isDimmed = hoveredSyn && !isHovered;

                    return (
                        <g key={syn.id} className="transition-opacity duration-500" style={{ opacity: isDimmed ? 0.2 : 1 }}>
                            {/* Syndicate Nebula Cloud */}
                            <circle
                                cx={`${syn.pos.x}%`}
                                cy={`${syn.pos.y}%`}
                                r="20%"
                                fill={`url(#grad-${syn.id})`}
                                className="mix-blend-screen"
                            />

                            {/* Constellation Lines */}
                            {syn.souls.map((soul, i) => (
                                syn.souls.slice(i + 1).map((target, j) => (
                                    <motion.line
                                        key={`${soul.id}-${target.id}`}
                                        x1={`${soul.coordinates.x}%`}
                                        y1={`${soul.coordinates.y}%`}
                                        x2={`${target.coordinates.x}%`}
                                        y2={`${target.coordinates.y}%`}
                                        stroke={syn.color}
                                        strokeWidth="0.5"
                                        strokeOpacity={isHovered ? 0.6 : 0.2}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: i * 0.1 }}
                                    />
                                ))
                            ))}
                            
                            {/* Syndicate Label */}
                             <foreignObject 
                                x={`${syn.pos.x}%`} 
                                y={`${syn.pos.y + 15}%`} 
                                width="120" height="40" 
                                style={{ transform: 'translateX(-60px)', overflow: 'visible' }}
                            >
                                <div className="flex flex-col items-center">
                                    <span 
                                        className={`text-[9px] font-bold text-white uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-md border transition-all duration-300 ${isHovered ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent opacity-50'}`}
                                        style={{ textShadow: `0 0 10px ${syn.color}` }}
                                    >
                                        {syn.name}
                                    </span>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            {/* 4. Stars Layer (Interactive) */}
            <div className="absolute inset-0 z-20">
                {consortium.flatMap(syn => {
                    const isDimmed = hoveredSyn && hoveredSyn !== syn.id;
                    return syn.souls.map(soul => (
                        <div 
                            key={soul.id}
                            onMouseEnter={() => setHoveredSyn(syn.id)}
                            onMouseLeave={() => setHoveredSyn(null)}
                        >
                            <StarGlyph 
                                soul={soul} 
                                color={syn.color}
                                isSelected={selectedSoul?.id === soul.id} 
                                onClick={(s) => setSelectedSoul(s)}
                                isDimmed={!!isDimmed}
                            />
                        </div>
                    ));
                })}
            </div>

            {/* Static UI Overlays */}
            <div className="absolute top-6 left-6 pointer-events-none z-40">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <CrownIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-comfortaa text-white tracking-tight">The Pantheon</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-[0.2em]">Observing {SYNDICATE_DATA.length} Constellations</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Soul Inspection Panel */}
            <AnimatePresence>
                {selectedSoul && (
                    <>
                        {/* Scrim */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40" 
                            onClick={() => setSelectedSoul(null)} 
                        />
                        <SoulCard soul={selectedSoul} onClose={() => setSelectedSoul(null)} />
                    </>
                )}
            </AnimatePresence>

            {/* Legend / Key */}
            <div className="absolute bottom-6 left-6 flex gap-4 z-30 pointer-events-none opacity-60">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rotate-45" />
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider">Motion</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-white" />
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider">Silence</span>
                </div>
            </div>

            {/* Meta Stats */}
            <div className="absolute bottom-6 right-6 text-right opacity-40 group-hover/pantheon:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">Grid Resolution: 1:1,000,000</div>
                <div className="text-[9px] font-mono text-patina-green">SYNDICATE_COHERENCE: 94.2%</div>
            </div>
        </div>
    );
};

export default ThePantheon;