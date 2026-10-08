
/**
 * @file components/operations/ProjectRoadmap.tsx
 * @description A Gantt-chart style visualization for operational tasks.
 * Displays task duration, sequencing, and assignee workload over a timeline.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import type { OperationTask } from '../../types';
import { ClockIcon } from '../icons/AetheriumIcons';

interface ProjectRoadmapProps {
    tasks: OperationTask[];
}

export const ProjectRoadmap: React.FC<ProjectRoadmapProps> = ({ tasks }) => {
    // Helper to position tasks on a relative timeline
    const getPosition = (dateStr: string, durationHours: number) => {
        const now = new Date();
        const due = new Date(dateStr);
        // Mock start date: Due date minus duration (in days for visual simplicity)
        const start = new Date(due.getTime() - (durationHours * 3600 * 1000 * 4)); // Visual scaling
        
        const daySpan = 14; // Viewport of 2 weeks
        const pxPerDay = 60;
        
        const daysFromNow = (start.getTime() - now.getTime()) / (1000 * 3600 * 24);
        const width = Math.max(60, (durationHours / 24) * pxPerDay * 2); // Minimum width
        
        // Offset from left (center is "today")
        const left = (daysFromNow + 2) * pxPerDay; 
        
        return { left, width };
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        const key = task.assignee || 'Unassigned';
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {} as Record<string, OperationTask[]>);

    return (
        <ModuleCard title="Strategic Roadmap" icon={<ClockIcon className="w-5 h-5 text-roman-aqua" />} className="lg:col-span-3">
            <div className="overflow-x-auto custom-scrollbar pb-4">
                <div className="min-w-[800px] space-y-6">
                    {/* Time Scale */}
                    <div className="flex border-b border-white/5 pb-2 ml-32">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className="w-[60px] text-[9px] text-text-tertiary font-mono uppercase border-l border-white/5 pl-1">
                                {i === 2 ? <span className="text-patina-green font-bold">TODAY</span> : `T+${i-2}d`}
                            </div>
                        ))}
                    </div>

                    {/* Lanes */}
                    {Object.entries(groupedTasks).map(([assignee, assigneeTasks]: [string, OperationTask[]]) => (
                        <div key={assignee} className="relative">
                            <div className="absolute left-0 top-0 w-32 pr-4 py-2 border-r border-white/5">
                                <div className="text-xs font-bold text-white truncate">{assignee}</div>
                                <div className="text-[9px] text-text-tertiary">{assigneeTasks.length} Directives</div>
                            </div>
                            
                            <div className="ml-32 min-h-[40px] relative py-1 space-y-2">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {Array.from({ length: 14 }).map((_, i) => (
                                        <div key={i} className="w-[60px] border-l border-white/5 h-full" />
                                    ))}
                                </div>

                                {assigneeTasks.map(task => {
                                    const { left, width } = getPosition(task.due, task.estimatedHours || 24);
                                    const statusColor = task.status === 'Done' ? 'bg-patina-green/20 border-patina-green/50 text-patina-green' 
                                        : task.status === 'Blocked' ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                                        : 'bg-roman-aqua/20 border-roman-aqua/50 text-roman-aqua';

                                    return (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`relative h-8 rounded-md border flex items-center px-2 text-[10px] font-bold whitespace-nowrap cursor-pointer hover:brightness-125 transition-all ${statusColor}`}
                                            style={{ marginLeft: `${left}px`, width: `${width}px` }}
                                        >
                                            {task.title}
                                            {task.status === 'Blocked' && <span className="ml-2 animate-pulse">⚠</span>}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ModuleCard>
    );
};
