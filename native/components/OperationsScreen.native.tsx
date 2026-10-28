/**
 * @file OperationsScreen.native.tsx
 * @description React Native Operations & Task Board screen for ΛΞVOS.
 * Provides mission timelines, agent load balancing, and dispatch execution.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassPane } from './GlassPane.native.js';
import { AcquisitionButton } from './AcquisitionButton.native.js';
import { FlowLiquidTransfer } from './FlowLiquidTransfer.native.js';
import { useHaptics } from '../../hooks/native/useHaptics.native.js';

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'CRITICAL' | 'NOMINAL' | 'DEFERRED';
  status: 'PENDING' | 'DISPATCHED' | 'CONVERGED';
}

export function OperationsScreenNative() {
  const { breakGlassSeal, turnStoneWheel } = useHaptics();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Deploy Turso database shard for Tenant Ω-4',
      assignee: 'Demiurge Core',
      priority: 'CRITICAL',
      status: 'DISPATCHED',
    },
    {
      id: 'task-2',
      title: 'Re-index Appwrite PostgreSQL relations & table permissions',
      assignee: 'Aegis Sentinel',
      priority: 'NOMINAL',
      status: 'PENDING',
    },
    {
      id: 'task-3',
      title: 'Synthesize quarterly CEVM financial prospectus',
      assignee: 'Klepsydra Ledger',
      priority: 'NOMINAL',
      status: 'CONVERGED',
    },
  ]);

  const toggleTaskStatus = (id: string) => {
    turnStoneWheel();
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus =
            t.status === 'PENDING'
              ? 'DISPATCHED'
              : t.status === 'DISPATCHED'
              ? 'CONVERGED'
              : 'PENDING';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Operations & Execution Log</Text>
      <Text style={styles.subtitle}>
        Real-time dispatch pipeline and agent task convergence.
      </Text>

      {/* Bio-Digital Liquid Data Transfer */}
      <GlassPane style={styles.pane} borderColor="#3EB991">
        <Text style={styles.paneTitle}>Syndicate Telemetry Flow</Text>
        <FlowLiquidTransfer
          progressPercent={72}
          fileSizeBytes={3200000}
          label="Agent Model Weight Synchronization"
        />
      </GlassPane>

      {/* Task Mission Queue */}
      <GlassPane style={styles.pane} borderColor="#20B2AA">
        <Text style={styles.paneTitle}>Active Dispatch Missions</Text>
        <Text style={styles.paneDescription}>
          Tap any mission to advance its convergence state through the BEEP protocol.
        </Text>

        {tasks.map(task => {
          const isCritical = task.priority === 'CRITICAL';
          const isConverged = task.status === 'CONVERGED';
          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      borderColor: isCritical ? '#EF4444' : '#20B2AA',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: isCritical ? '#EF4444' : '#20B2AA' },
                    ]}
                  >
                    {task.priority}
                  </Text>
                </View>
              </View>

              <View style={styles.taskFooter}>
                <Text style={styles.assigneeText}>
                  Summoned: {task.assignee}
                </Text>
                <AcquisitionButton
                  label={task.status}
                  variant={isConverged ? 'secondary' : 'primary'}
                  onPress={() => toggleTaskStatus(task.id)}
                  style={styles.statusBtn}
                />
              </View>
            </View>
          );
        })}

        <AcquisitionButton
          label="Provision Batch Agent Workflow"
          variant="primary"
          onPress={() => {
            breakGlassSeal();
          }}
          style={{ marginTop: 12 }}
        />
      </GlassPane>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 110,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5FFFA',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.6,
    marginBottom: 16,
  },
  pane: {
    marginBottom: 16,
  },
  paneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5FFFA',
    marginBottom: 6,
  },
  paneDescription: {
    fontSize: 12,
    color: '#F5FFFA',
    opacity: 0.7,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 255, 250, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5FFFA',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeText: {
    fontSize: 11,
    color: '#3EB991',
  },
  statusBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
