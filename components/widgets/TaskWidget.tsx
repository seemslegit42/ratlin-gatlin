
/**
 * @file components/widgets/TaskWidget.tsx
 * @description Displays a task creation confirmation card.
 */

import React, { useState } from 'react';
import type { TaskWidgetData, OperationTask, View } from '../../types';
import { ListTodoIcon } from '../icons/ListTodoIcon';

interface TaskWidgetProps {
  data: TaskWidgetData;
  onInteraction?: (cmd: string) => void;
  onNavigate?: (view: View) => void;
}

const TaskWidget: React.FC<TaskWidgetProps> = ({ data, onInteraction, onNavigate }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [priority, setPriority] = useState<OperationTask['priority']>(data.priority || 'Medium');

  const handleConfirm = () => {
    setConfirmed(true);
    if (onInteraction) {
      onInteraction(`Confirm task "${data.taskName}" with ${priority} priority for ${data.assignee}`);
    }
  };

  const handleGoToOps = () => {
    if (onNavigate) onNavigate('operations');
  };

  return (
    <div className="bg-panel-bg/60 backdrop-blur-xl border border-glass-border rounded-xl p-5 shadow-glass w-full max-w-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <ListTodoIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-comfortaa font-bold text-vitreous-white">New Task Draft</h4>
          <p className="text-xs text-text-tertiary">Operations Module</p>
        </div>
      </div>

      <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-white/5 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Task:</span>
          <span className="font-bold text-white text-right">{data.taskName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Assignee:</span>
          <span className="text-imperial-purple font-bold">{data.assignee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Due:</span>
          <span className="text-white font-mono">{data.dueDate}</span>
        </div>
        {data.location && (
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Location:</span>
            <span className="text-text-tertiary text-right">{data.location}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Priority:</span>
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                disabled={confirmed}
                className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:border-blue-400 outline-none"
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
            </select>
        </div>
      </div>

      {confirmed ? (
        <div 
          onClick={handleGoToOps}
          className="w-full py-2 bg-patina-green/20 text-patina-green border border-patina-green/50 rounded-lg text-xs font-bold text-center cursor-pointer hover:bg-patina-green/30 transition-all"
        >
          Task Confirmed: {priority.toUpperCase()} Priority →
        </div>
      ) : (
        <div className="flex space-x-2">
          <button 
            onClick={handleGoToOps}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-text-secondary rounded-lg text-xs font-bold transition-colors"
          >
            Manage
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg hover:shadow-blue-500/30"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskWidget;
