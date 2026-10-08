
/**
 * @file hooks/useTaskNotifier.ts
 * @description background monitor for the Operations module.
 * Scans active directives for due or overdue milestones and triggers Sovereign alerts.
 */

import { useEffect, useRef } from 'react';
import type { OperationTask } from '../types.js';

/**
 * Hook to scan and notify on impending task deadlines.
 * 
 * @param tasks - Array of operational tasks to monitor.
 * @param addNotification - Notification dispatcher.
 */
export const useTaskNotifier = (
  tasks: OperationTask[],
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void
) => {
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    /** Runs the scan against current system clock. */
    const checkDueTasks = () => {
      const now = new Date();
      const todayString = now.toISOString().split('T')[0];

      tasks.forEach(task => {
        if (notifiedTasks.current.has(task.id)) return;
        if (task.status === 'Done') return;

        if (task.due === todayString) {
             addNotification(`Task Due Today: ${task.title}`, 'info');
             notifiedTasks.current.add(task.id);
             return;
        }

        const dueDate = new Date(task.due);
        if (!isNaN(dueDate.getTime())) {
            // Check if it's a valid date string YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(task.due)) {
                if (task.due < todayString) {
                    addNotification(`Overdue Directive: ${task.title}`, 'error');
                    notifiedTasks.current.add(task.id);
                }
            } else if (dueDate < now) {
                // Fallback for other date formats if parsed correctly
                addNotification(`Overdue Directive: ${task.title}`, 'error');
                notifiedTasks.current.add(task.id);
            }
        }
      });
    };

    checkDueTasks();
    
    // Poll every minute to check for date rollovers or immediate updates
    const intervalId = setInterval(checkDueTasks, 60000); 
    
    return () => clearInterval(intervalId);
  }, [tasks, addNotification]);
};
