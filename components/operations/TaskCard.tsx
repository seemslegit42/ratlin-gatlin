
/**
 * @file components/operations/TaskCard.tsx
 * @description A draggable, interactive card representing an OperationTask.
 * Displays task details and allows for status cycling and deletion.
 * Enhanced with assignee avatars derived from initials.
 */

import React from 'react';
import type { OperationTask } from '../../types.js';
import { motion, AnimatePresence } from 'framer-motion';
import { ZapIcon } from '../icons/VitalsIcons.js';
import { BrainIcon } from '../icons/BrainIcon.js';
import { CheckCircleIcon } from '../icons/AgentStatusIcons.js';

interface TaskCardProps {
  task: OperationTask;
  onUpdate: (id: string, updates: Partial<OperationTask>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<Element>, taskId: string, currentStatus: OperationTask['status']) => void;
  onStatusCycle: (task: OperationTask) => void;
}

const STATUS_STYLE_MAP: Record<OperationTask['status'], { dot: string; text: string; bg: string; border: string }> = {
    'Pending': { dot: 'bg-white/20', text: 'text-text-tertiary', bg: 'bg-white/5', border: 'border-white/10' },
    'In Progress': { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'Done': { dot: 'bg-patina-green', text: 'text-patina-green', bg: 'bg-patina-green/10', border: 'border-patina-green/20' },
    'Blocked': { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const PRIORITY_STYLE_MAP: Record<OperationTask['priority'], { text: string; bg: string; border: string; baseBorder: string }> = {
  'Low': { text: 'text-text-secondary', bg: 'bg-white/5', border: 'border-white/10', baseBorder: 'border-white/10' },
  'Medium': { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', baseBorder: 'border-blue-500/20' },
  'High': { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', baseBorder: 'border-yellow-400/40' },
  'Critical': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', baseBorder: 'border-red-500/50' },
};

/**
 * Extracts initials from an assignee name.
 */
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

/**
 * Hashes a string to a stable color from the Verdigris palette.
 */
const getAvatarColor = (name: string): string => {
    const colors = ['#6A0DAD', '#20B2AA', '#3EB991', '#FFD700', '#F97316', '#3B82F6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onDragStart, onStatusCycle }) => {
  const statusStyle = STATUS_STYLE_MAP[task.status];
  const priorityStyle = PRIORITY_STYLE_MAP[task.priority];
  const isDone = task.status === 'Done';

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(task.id, { priority: e.target.value as OperationTask['priority'] });
  };

  const assigneeColor = getAvatarColor(task.assignee);
  const isAgentAssignee = task.assigneeType === 'Agent' || task.assignee.toLowerCase().includes('agent');

  return (
    <motion.div
      layout
      layoutId={task.id}
      draggable="true"
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent<Element>, task.id, task.status)}
      className={`group relative p-4 bg-black/20 rounded-xl border transition-all hover:bg-white/5 cursor-grab active:cursor-grabbing shadow-sm ${priorityStyle.baseBorder}`}
    >
      {/* Visual Identity Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${statusStyle.dot}`} />
      
      <div className="flex justify-between items-start pl-3">
        <div className="min-w-0 flex-grow">
          <div className="flex items-center gap-2 mb-1">
             <h4 className={`text-sm font-bold transition-colors truncate pr-2 ${isDone ? 'text-text-secondary line-through decoration-patina-green/50 decoration-2' : 'text-vitreous-white group-hover:text-cyan-400'}`}>
                 {task.title}
             </h4>
             
             <AnimatePresence>
                 {isDone && (
                     <motion.div
                         initial={{ scale: 0, opacity: 0, rotate: -45 }}
                         animate={{ scale: 1, opacity: 1, rotate: 0 }}
                         exit={{ scale: 0, opacity: 0, rotate: -45 }}
                         transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                         className="text-patina-green flex-shrink-0"
                     >
                         <CheckCircleIcon className="w-4 h-4" />
                     </motion.div>
                 )}
             </AnimatePresence>

             {task.complexity && task.complexity > 7 && (
                 <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1 rounded font-bold uppercase">Complex</span>
             )}
          </div>
          
          <div className="flex flex-col space-y-2 mt-2">
            {/* Assignee Identity Block */}
            <div className="flex items-center space-x-2">
                <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border ${isAgentAssignee ? 'border-imperial-purple/50' : 'border-white/10'}`}
                    style={{ backgroundColor: assigneeColor }}
                >
                    {isAgentAssignee ? <BrainIcon className="w-3.5 h-3.5" /> : getInitials(task.assignee)}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${
                    isAgentAssignee ? 'text-imperial-purple' : 'text-text-secondary'
                }`}>
                    {task.assignee}
                </span>
            </div>

            {/* Metrics Row */}
            <div className="flex items-center space-x-3">
                <div className="flex items-center gap-1 text-[9px] text-text-tertiary font-mono">
                    <span className="opacity-50">DUE:</span>
                    <span>{task.due}</span>
                </div>
                {task.estimatedHours && (
                    <div className="flex items-center gap-1 text-[9px] text-text-tertiary font-mono">
                         <span className="opacity-50">EFFORT:</span>
                         <span>{task.estimatedHours}h</span>
                    </div>
                )}
                {task.location && <span className="text-[9px] text-text-tertiary truncate opacity-70 italic">📍 {task.location}</span>}
            </div>

            {/* Workload Indicator (Small Heat Bar) */}
            {task.energyConsumption !== undefined && (
                <div className="w-full pt-1">
                    <div className="flex justify-between items-center text-[8px] uppercase font-bold text-text-tertiary mb-1">
                         <span>Cognitive Load</span>
                         <span>{task.energyConsumption}%</span>
                    </div>
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${task.energyConsumption}%` }}
                            className={`h-full rounded-full ${task.energyConsumption > 60 ? 'bg-red-500' : 'bg-patina-green'}`}
                        />
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2 shrink-0 ml-4">
            <div className="relative group/sel">
                <select
                    value={task.priority}
                    onChange={handlePriorityChange}
                    className={`w-24 text-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border cursor-pointer appearance-none bg-no-repeat bg-[length:0.5rem_0.5rem] bg-[position:right_0.5rem_center] transition-colors focus:ring-1 focus:ring-white/20 ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>
          
          <button 
            onClick={() => onStatusCycle(task)}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border transition-colors w-24 text-center ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} hover:border-white/20`}
            title="Click to cycle status"
          >
            {task.status}
          </button>
          
          <div className="flex items-center gap-1 pt-1">
             <button 
                onClick={() => onDelete(task.id)} 
                className="text-text-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/5 rounded"
                title="Delete task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </button>
              <button 
                className="text-text-tertiary hover:text-roman-aqua opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/5 rounded"
                title="View Execution Log"
              >
                <ZapIcon className="w-3.5 h-3.5" />
              </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
