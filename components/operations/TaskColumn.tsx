
/**
 * @file components/operations/TaskColumn.tsx
 * @description A component representing a single column (status lane) in the Operations task board.
 * Supports dropping dragged tasks to change their status and automatically sorts by priority, due date, or assignee.
 */

import React, { useState, useMemo } from 'react';
import type { OperationTask } from '../../types';
import { TaskCard } from './TaskCard';
import type { TaskSortOption } from '../../modules/operations/OperationsView';

interface TaskColumnProps {
  status: OperationTask['status'];
  tasks: OperationTask[];
  onDropTask: (taskId: string, targetStatus: OperationTask['status']) => void;
  onUpdateTask: (id: string, updates: Partial<OperationTask>) => void;
  onDeleteTask: (id: string) => void;
  onStatusCycle: (task: OperationTask) => void;
  sortBy: TaskSortOption;
}

const STATUS_COLORS: Record<OperationTask['status'], { border: string, bg: string, text: string }> = {
    'Pending': { border: 'border-white/20', bg: 'bg-white/5', text: 'text-text-secondary' },
    'In Progress': { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    'Done': { border: 'border-patina-green/50', bg: 'bg-patina-green/10', text: 'text-patina-green' },
    'Blocked': { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400' },
};

const PRIORITY_WEIGHT: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onDropTask, onUpdateTask, onDeleteTask, onStatusCycle, sortBy }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus') as OperationTask['status'];

    if (taskId && sourceStatus !== status) {
      onDropTask(taskId, status);
    }
  };

  // Sort tasks based on selected sorting option
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
        if (sortBy === 'Priority') {
            const weightA = PRIORITY_WEIGHT[a.priority] || 1;
            const weightB = PRIORITY_WEIGHT[b.priority] || 1;
            return weightB - weightA;
        } else if (sortBy === 'Due Date') {
            const dateA = new Date(a.due).getTime() || Infinity;
            const dateB = new Date(b.due).getTime() || Infinity;
            return dateA - dateB;
        } else if (sortBy === 'Assignee') {
            return a.assignee.localeCompare(b.assignee);
        }
        return 0;
    });
  }, [tasks, sortBy]);

  const statusStyle = STATUS_COLORS[status];

  return (
    <div
      className={`bg-panel-bg/30 border rounded-xl p-4 flex flex-col h-full min-h-[300px] transition-colors ${isDragOver ? `${statusStyle.border} ${statusStyle.bg}` : 'border-glass-border'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <h3 className={`text-sm font-bold uppercase ${statusStyle.text} mb-4 flex justify-between items-center`}>
        {status}
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusStyle.border} ${statusStyle.bg}`}>{tasks.length}</span>
      </h3>

      {/* Scrollable list of tasks */}
      <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onDragStart={(e, taskId, currentStatus) => {
              e.dataTransfer.setData('taskId', taskId);
              e.dataTransfer.setData('sourceStatus', currentStatus);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onStatusCycle={onStatusCycle}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-text-tertiary text-xs">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
