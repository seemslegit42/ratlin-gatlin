/**
 * Single-pass aggregation of agent-derived HUD resource metrics.
 */

import type { Agent } from '../types';
import { AgentStatus } from '../types';

export interface AgentResourceSnapshot {
  totalAgents: number;
  coherenceScore: number;
  cpuLoad: number;
  memLoad: number;
}

export function computeAgentResourceMetrics(agents: Record<string, Agent>): AgentResourceSnapshot {
  const agentList = Object.values(agents) as Agent[];
  const totalAgents = agentList.length;

  let operational = 0;
  let warning = 0;
  let processing = 0;

  agentList.forEach((agent: Agent) => {
    if ([AgentStatus.OPERATIONAL, AgentStatus.Success, AgentStatus.Idle].includes(agent.status)) {
      operational += 1;
    } else if ([AgentStatus.DEGRADED, AgentStatus.Error].includes(agent.status)) {
      warning += 1;
    } else if ([AgentStatus.COMPILING, AgentStatus.Running, AgentStatus.Pending].includes(agent.status)) {
      processing += 1;
    }
  });

  const coherenceScore =
    totalAgents === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            ((operational * 1 + processing * 0.7 + warning * 0.4) / totalAgents) * 100,
          ),
        );

  if (totalAgents === 0) {
    return { totalAgents, coherenceScore, cpuLoad: 2, memLoad: 5 };
  }

  const active = agentList.filter(
    (a) => a.status === AgentStatus.Running || a.status === AgentStatus.Pending,
  ).length;
  const degraded = agentList.filter(
    (a) => a.status === AgentStatus.DEGRADED || a.status === AgentStatus.Error,
  ).length;

  const cpuLoad = Math.min(100, Math.max(3, 5 + active * 14 + degraded * 3));
  const memLoad = Math.min(100, 10 + totalAgents * 2 + active * 5 + degraded * 1.5);

  return { totalAgents, coherenceScore, cpuLoad, memLoad };
}
