
/**
 * @file components/hrm/TalentConstellation.tsx
 * @description A visual representation of the talent network, emphasizing the hybrid workforce (Human + AI).
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { UsersIcon } from '../icons/QuickActionIcons';
import { motion } from 'framer-motion';

export const TalentConstellation: React.FC = () => {
    // Mock Nodes positions
    const nodes = [
        { id: 1, x: 50, y: 50, type: 'Human', role: 'Founder' },
        { id: 2, x: 20, y: 80, type: 'Agent', role: 'Ops' },
        { id: 3, x: 80, y: 80, type: 'Agent', role: 'Sales' },
        { id: 4, x: 50, y: 20, type: 'Agent', role: 'Dev' },
        { id: 5, x: 20, y: 40, type: 'Human', role: 'Lead' },
    ];

    return (
        <ModuleCard title="Talent Constellation" icon={<UsersIcon className="w-5 h-5 text-indigo-400" />} className="lg:col-span-2">
            <div className="h-64 bg-black/40 rounded-lg relative overflow-hidden border border-white/5 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full">
                    {/* Connections */}
                    <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="20%" y2="40%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                </svg>

                {nodes.map((node, i) => (
                    <motion.div
                        key={node.id}
                        className={`absolute w-12 h-12 rounded-full border border-white/10 flex items-center justify-center flex-col shadow-lg backdrop-blur-sm
                                    ${node.type === 'Human' ? 'bg-indigo-500/20' : 'bg-patina-green/20'}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                    >
                        <div className={`w-2 h-2 rounded-full mb-1 ${node.type === 'Human' ? 'bg-indigo-400' : 'bg-patina-green'}`} />
                        <span className="text-[8px] font-bold uppercase text-white/80">{node.role}</span>
                    </motion.div>
                ))}
            </div>
        </ModuleCard>
    );
};
