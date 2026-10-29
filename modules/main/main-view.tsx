/**
 * @file modules/main/main-view.tsx
 * @description Live mode home shell: vitals strip (~top third) + command stream (~bottom two-thirds).
 * Architect mode on `/` is `modules/weaver/Weaver.tsx` — see docs/unified-workspace-architecture.md.
 */

import React, { useMemo } from 'react';
import type {
  Agent,
  View,
  KlepsydraMetric,
  ChatMessage,
} from '../../types.js';
import type { XiFlowData } from '../../services/xiEconomyService.js';
import { VitalsStrip } from '../../components/vitals/vitals-strip.js';
import CommandStream from '../../components/CommandStream.js';

export interface MainViewProps {
  agents?: Record<string, Agent>;
  onNavigate: (view: View) => void;
  klepsydra?: KlepsydraMetric;
  economyData?: XiFlowData | null;
  messages?: ChatMessage[];
  onSendCommand?: (cmd: string, attach?: { name: string; mimeType: string; data: string }) => void;
}

const MainView: React.FC<MainViewProps> = ({
  agents = {},
  onNavigate,
  klepsydra,
  messages = [],
  onSendCommand = () => {},
}) => {
  const activeAgents = Object.values(agents).filter((a) => a?.status !== 'Idle').length;
  const totalAgents = Object.keys(agents).length;
  const profitVelocity = klepsydra?.flowScore ?? 0;
  const marketDisruption = 68;
  const projectStatus = 'Project Genesis';
  const projectProgress = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 45;

  const streamHandlers = useMemo(
    () => ({
      onWidgetInteraction: onSendCommand,
      onNavigate,
    }),
    [onSendCommand, onNavigate],
  );

  return (
    <div className="h-full w-full relative bg-obsidian-black flex flex-col font-lexend overflow-hidden high-density">
      {/* Top third — non-interactive vitals windshield */}
      <section
        className="flex-shrink-0 h-[33%] min-h-[132px] max-h-[220px] border-b border-white/10 z-10"
        aria-label="Vitals HUD"
      >
        <VitalsStrip
          profitVelocity={profitVelocity}
          marketDisruption={marketDisruption}
          projectStatus={projectStatus}
          projectProgress={projectProgress}
        />
      </section>

      {/* Bottom two-thirds — Command Stream */}
      <section className="flex-1 min-h-0 flex flex-col relative z-0 pb-2" aria-label="Command Stream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(32,178,170,0.06),transparent_65%)] pointer-events-none" />
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 md:px-5 pt-3 pb-28 md:pb-32">
          <div className="max-w-3xl mx-auto w-full h-full min-h-[200px]">
            <CommandStream
              messages={messages}
              onWidgetInteraction={streamHandlers.onWidgetInteraction}
              onNavigate={streamHandlers.onNavigate}
            />
          </div>
        </div>
      </section>

      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.02] bg-repeat [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
        aria-hidden
      />
    </div>
  );
};

export default MainView;
