
/**
 * @file components/marketing/InfluencerGraph.tsx
 * @description A network visualization of brand influencers and their audience overlap.
 * Allows the Sovereign to "Recruit" high-value nodes into the brand narrative.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ShareIcon } from '../icons/MarketingIcons';
import { UserGroupIcon } from '../icons/CommandPaletteIcons';

interface Influencer {
    id: string;
    name: string;
    handle: string;
    reach: number; // Followers
    engagement: number; // %
    cost: number; // $ per post
    overlap: number; // % audience match
    status: 'Target' | 'Recruited' | 'Ignored';
    pos: { x: number; y: number };
}

const INFLUENCERS: Influencer[] = [
    { id: '1', name: 'TechAltar', handle: '@techaltar', reach: 450000, engagement: 4.2, cost: 2500, overlap: 85, status: 'Recruited', pos: { x: 50, y: 50 } },
    { id: '2', name: 'CodeLife', handle: '@codelife', reach: 120000, engagement: 8.5, cost: 800, overlap: 92, status: 'Target', pos: { x: 30, y: 30 } },
    { id: '3', name: 'DesignSnob', handle: '@dsgn_snob', reach: 80000, engagement: 3.1, cost: 1200, overlap: 45, status: 'Ignored', pos: { x: 70, y: 40 } },
    { id: '4', name: 'FutureSynth', handle: '@fsynth', reach: 210000, engagement: 6.0, cost: 1800, overlap: 78, status: 'Target', pos: { x: 40, y: 70 } },
    { id: '5', name: 'StartupGrind', handle: '@s_grind', reach: 900000, engagement: 1.2, cost: 5000, overlap: 60, status: 'Target', pos: { x: 60, y: 80 } },
];

export const InfluencerGraph: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [data, setData] = useState(INFLUENCERS);

    const handleRecruit = (id: string) => {
        setData(prev => prev.map(inf => inf.id === id ? { ...inf, status: 'Recruited' } : inf));
    };

    return (
        <ModuleCard title="Influencer Nexus" icon={<ShareIcon className="w-5 h-5 text-pink-500" />}>
            <div className="flex flex-col lg:flex-row h-[500px] gap-6">
                
                {/* Visual Graph */}
                <div className="flex-grow relative bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0%,transparent_70%)]" />
                    
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {/* Connections */}
                        {data.map((inf, i) => (
                            data.slice(i + 1).map((target) => {
                                const opacity = (inf.overlap + target.overlap) / 200 * 0.5;
                                return (
                                    <line 
                                        key={`${inf.id}-${target.id}`}
                                        x1={`${inf.pos.x}%`} y1={`${inf.pos.y}%`}
                                        x2={`${target.pos.x}%`} y2={`${target.pos.y}%`}
                                        stroke="white" strokeWidth="1" strokeOpacity={opacity}
                                    />
                                );
                            })
                        ))}
                    </svg>

                    {data.map((inf) => (
                        <motion.button
                            key={inf.id}
                            className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                                selectedId === inf.id ? 'scale-125 z-20 border-white bg-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 
                                inf.status === 'Recruited' ? 'border-patina-green bg-patina-green/10' : 
                                inf.status === 'Ignored' ? 'border-white/10 bg-white/5 opacity-50' : 
                                'border-pink-500/50 bg-black/60 hover:border-pink-500'
                            }`}
                            style={{ left: `${inf.pos.x}%`, top: `${inf.pos.y}%` }}
                            onClick={() => setSelectedId(inf.id)}
                            whileHover={{ scale: 1.1 }}
                        >
                            <span className="text-[10px] font-bold text-white">{inf.name[0]}</span>
                            {/* Halo for Reach */}
                            <div 
                                className="absolute inset-0 rounded-full border border-white/10" 
                                style={{ transform: `scale(${1 + inf.reach / 500000})` }}
                            />
                        </motion.button>
                    ))}
                    
                    <div className="absolute bottom-4 left-4 text-[10px] text-text-tertiary pointer-events-none">
                        Graph represents Audience Overlap & Reach
                    </div>
                </div>

                {/* Inspector Side Panel */}
                <div className="w-full lg:w-72 flex-shrink-0 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col">
                    {selectedId ? (
                        (() => {
                            const inf = data.find(i => i.id === selectedId)!;
                            return (
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={inf.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="pb-4 border-b border-white/10">
                                            <h3 className="text-lg font-bold text-white">{inf.name}</h3>
                                            <p className="text-xs text-text-tertiary font-mono">{inf.handle}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-2 bg-black/20 rounded">
                                                <div className="text-[9px] text-text-tertiary uppercase">Reach</div>
                                                <div className="text-sm font-bold text-white">{(inf.reach / 1000).toFixed(1)}k</div>
                                            </div>
                                            <div className="p-2 bg-black/20 rounded">
                                                <div className="text-[9px] text-text-tertiary uppercase">Eng. Rate</div>
                                                <div className="text-sm font-bold text-patina-green">{inf.engagement}%</div>
                                            </div>
                                            <div className="p-2 bg-black/20 rounded">
                                                <div className="text-[9px] text-text-tertiary uppercase">Match</div>
                                                <div className="text-sm font-bold text-roman-aqua">{inf.overlap}%</div>
                                            </div>
                                            <div className="p-2 bg-black/20 rounded">
                                                <div className="text-[9px] text-text-tertiary uppercase">Est. Cost</div>
                                                <div className="text-sm font-bold text-yellow-400">${inf.cost}</div>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            {inf.status === 'Recruited' ? (
                                                <div className="w-full py-2 bg-patina-green/20 border border-patina-green/50 text-patina-green rounded-lg text-xs font-bold text-center uppercase tracking-wider">
                                                    Active Asset
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRecruit(inf.id)}
                                                    className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-pink-500/20"
                                                >
                                                    Initiate Contract
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            );
                        })()
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                            <UserGroupIcon className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-xs text-center px-4">Select a node to analyze potential resonance.</p>
                        </div>
                    )}
                </div>
            </div>
        </ModuleCard>
    );
};
