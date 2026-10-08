/**
 * @file hooks/useOperationsState.ts
 * @description Manages the state for the Operations Module (Tasks/Projects), including persistence.
 */

import { useCallback, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { OperationTask, TableTask } from '../types.js';
import { tablesDB, DATABASE_ID, TABLES, Query, client } from '../services/appwriteClient.js';
import { ID } from 'appwrite';

// --- Mapping Helpers ---
const mapTaskToDB = (task: OperationTask): Partial<TableTask> => ({
  syndicate_id: task.syndicateId,
  title: task.title,
  status: task.status,
  assignee: task.assignee,
  assignee_type: task.assigneeType,
  due_date: task.due,
  priority: task.priority,
  location: task.location,
  complexity: task.complexity,
  estimated_hours: task.estimatedHours,
});

const mapDBToTask = (dbTask: any): OperationTask => ({
  id: dbTask.$id || dbTask.id,
  syndicateId: dbTask.syndicate_id,
  title: dbTask.title,
  status: dbTask.status,
  assignee: dbTask.assignee,
  assigneeType: (dbTask.assignee_type as 'Human' | 'Agent') || 'Human',
  due: dbTask.due_date,
  priority: dbTask.priority,
  location: dbTask.location,
  complexity: dbTask.complexity || 5,
  estimatedHours: dbTask.estimated_hours || 4,
  energyConsumption: Math.round((dbTask.complexity || 5) * 8.5)
});

export const useOperationsState = (
  syndicateId: string,
  authenticatedUserId?: string | null,
) => {
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Initial Data Load & Realtime Subscriptions ---
  const fetchInitialData = useCallback(async () => {
    if (!syndicateId) return;
    setIsLoading(true);
    try {
      const response = await tablesDB.listRows(
        DATABASE_ID,
        TABLES.OPERATIONS_TASKS,
        [Query.equal('syndicate_id', syndicateId)]
      );
      setTasks(response.documents.map(mapDBToTask));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [syndicateId]);

  useEffect(() => {
    if (!syndicateId || !authenticatedUserId) return;

    void fetchInitialData();

    // Realtime subscription
    const channel = `databases.${DATABASE_ID}.collections.${TABLES.OPERATIONS_TASKS}.documents`;
    const unsubscribe = client.subscribe(
        channel,
        (response) => {
            if (response.events.some(e => e.includes('.create') || e.includes('.update'))) {
                const record = response.payload as any;
                if (record.syndicate_id === syndicateId) {
                  setTasks(prev => {
                    const existing = prev.filter(t => t.id !== record.$id);
                    return [...existing, mapDBToTask(record)];
                  });
                }
            } else if (response.events.some(e => e.includes('.delete'))) {
                const record = response.payload as any;
                setTasks(prev => prev.filter(t => t.id !== record.$id));
            }
        }
    );

    return () => {
      unsubscribe();
    };
  }, [syndicateId, authenticatedUserId, fetchInitialData]);


  const addTask = useCallback(async (task: Omit<OperationTask, 'id' | 'status' | 'syndicateId'>) => {
    const dbId = ID.unique();
    const newTask: OperationTask = {
      id: dbId,
      status: 'Pending',
      syndicateId,
      priority: task.priority || 'Medium',
      complexity: task.complexity || 5,
      estimatedHours: task.estimatedHours || 4,
      energyConsumption: (task.complexity || 5) * 8,
      assigneeType: task.assigneeType || 'Human',
      ...task
    };
    
    // Optimistic update
    setTasks(prev => [...prev, newTask]);

    try {
      await tablesDB.createRow(
        DATABASE_ID,
        TABLES.OPERATIONS_TASKS,
        dbId,
        mapTaskToDB(newTask)
      );
    } catch (error) {
      console.error("Error adding task:", error);
    }
    return newTask;
  }, [syndicateId]);

  const updateTask = useCallback(async (id: string, updates: Partial<OperationTask>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    // Get full task for DB mapping
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    try {
      await tablesDB.updateRow(
        DATABASE_ID,
        TABLES.OPERATIONS_TASKS,
        id,
        mapTaskToDB({ ...currentTask, ...updates })
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      await tablesDB.deleteRow(
        DATABASE_ID,
        TABLES.OPERATIONS_TASKS,
        id
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }, []);

  const dispatchToAgent = useCallback(async (taskId: string, agentId: string, agentName: string) => {
      await updateTask(taskId, { 
          assignee: agentName, 
          assigneeType: 'Agent',
          status: 'In Progress' 
      });
  }, [updateTask]);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    dispatchToAgent
  };
};
