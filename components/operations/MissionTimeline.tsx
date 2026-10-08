
/**
 * @file components/operations/MissionTimeline.tsx
 * @description A horizontal, scrollable timeline visualizing active missions and milestones.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ListTodoIcon } from '../icons/ListTodoIcon';

export const MissionTimeline: React.FC = () => {
    const milestones = [
        { date: 'Oct 24', title: 'Alpha Launch', status: 'Complete', color: 'bg-patina-green' },
        { date: 'Oct 28', title: 'Agent Swarm Deployment', status: 'Active', color: 'bg-roman-aqua' },
        { date: 'Nov 02', title: 'Series B Outreach', status: 'Pending', color: 'bg-imperial-purple' },
        { date: 'Nov 15', title: 'Global Expansion', status: 'Pending', color: 'bg-text-tertiary' },
    ];

    return (
        <ModuleCard title="Mission Timeline" icon={<ListTodoIcon className="w-5 h-5 text-blue-400" />} className="lg:col-span-2">
            <div className="relative pt-6 pb-2">
                {/* Timeline Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
                
                <div className="flex justify-between items-center relative z-10">
                    {milestones.map((m, i) => (
                        <div key={i} className="flex flex-col items-center group cursor-pointer">
                            <div className={`w-4 h-4 rounded-full border-4 border-obsidian-black ${m.color} group-hover:scale-125 transition-transform shadow-[0_0_10px_currentColor]`} style={{ color: m.color }} />
                            <div className="mt-4 text-center">
                                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">{m.date}</div>
                                <div className="text-xs font-bold text-vitreous-white mt-1 group-hover:text-roman-aqua transition-colors">{m.title}</div>
                            </div>
                            
                            {/* Connector Line for active item */}
                            {m.status === 'Active' && (
                                <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-roman-aqua to-transparent opacity-50 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </ModuleCard>
    );
};
