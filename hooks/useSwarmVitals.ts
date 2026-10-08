/**
 * Single-pass aggregation of agent-derived HUD metrics (swarm health, load model).
 * VitalsHUD and desktop widgets share this so we do not scan `agents` twice per mount.
 */

import { useMemo } from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';

export interface SwarmStatusCounts {
  operational: number;
  warning: number;
  processing: number;
  offline: number;
}

export interface SwarmVitalsSnapshot {
  totalAgents: number;
  statusCounts: SwarmStatusCounts;
  coherenceScore: number;
  densityLabel: 'IDLE' | 'LOW' | 'MEDIUM' | 'HIGH';
  cpuLoad: number;
  memLoad: number;
}

const EMPTY_COUNTS: SwarmStatusCounts = {
  operational: 0,
  warning: 0,
  processing: 0,
  offline: 0,
};

export function computeSwarmVitals(agents: Record<string, Agent>): SwarmVitalsSnapshot {
  const agentList = Object.values(agents) as Agent[];
  const totalAgents = agentList.length;

  const statusCounts: SwarmStatusCounts = { ...EMPTY_COUNTS };

  agentList.forEach((agent: Agent) => {
    if ([AgentStatus.OPERATIONAL, AgentStatus.Success, AgentStatus.Idle].includes(agent.status)) {
      statusCounts.operational += 1;
    } else if ([AgentStatus.DEGRADED, AgentStatus.Error].includes(agent.status)) {
      statusCounts.warning += 1;
    } else if ([AgentStatus.COMPILING, AgentStatus.Running, AgentStatus.Pending].includes(agent.status)) {
      statusCounts.processing += 1;
    } else {
      statusCounts.offline += 1;
    }
  });

  const coherenceScore =
    totalAgents === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            ((statusCounts.operational * 1 + statusCounts.processing * 0.7 + statusCounts.warning * 0.4) /
              totalAgents) *
              100,
          ),
        );

  let densityLabel: SwarmVitalsSnapshot['densityLabel'] = 'LOW';
  if (totalAgents === 0) densityLabel = 'IDLE';
  else if (statusCounts.processing >= Math.ceil(totalAgents * 0.5)) densityLabel = 'HIGH';
  else if (statusCounts.processing >= Math.ceil(totalAgents * 0.25)) densityLabel = 'MEDIUM';

  if (totalAgents === 0) {
    return {
      totalAgents,
      statusCounts,
      coherenceScore,
      densityLabel,
      cpuLoad: 2,
      memLoad: 5,
    };
  }

  const active = agentList.filter((a) => a.status === AgentStatus.Running || a.status === AgentStatus.Pending).length;
  const degraded = agentList.filter((a) => a.status === AgentStatus.DEGRADED || a.status === AgentStatus.Error).length;

  const cpuLoad = Math.min(100, Math.max(3, 5 + active * 14 + degraded * 3));
  const memLoad = Math.min(100, 10 + totalAgents * 2 + active * 5 + degraded * 1.5);

  return {
    totalAgents,
    statusCounts,
    coherenceScore,
    densityLabel,
    cpuLoad,
    memLoad,
  };
}

export function useSwarmVitals(agents: Record<string, Agent>): SwarmVitalsSnapshot {
  return useMemo(() => computeSwarmVitals(agents), [agents]);
}
