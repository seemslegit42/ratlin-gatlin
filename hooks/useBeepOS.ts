/**
 * @file hooks/useBeepOS.ts
 * @description React hook managing the reactive state of the BEEP Enterprise Operating System:
 * - Dynamic Value Stream self-organization
 * - Anticipatory market radar & proactive maneuver execution
 * - Antifragile chaos stress-testing & shock absorption
 * - Sassy BEEP fourth-wall breaks & easter eggs
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  type BeepOSState,
  type ValueStream,
  type MarketWeakSignal,
  type AnticipatoryManeuver,
  type ChaosStressScenario,
  type ChaosEventRecord,
  INITIAL_VALUE_STREAMS,
  INITIAL_WEAK_SIGNALS,
  INITIAL_ANTICIPATORY_MANEUVERS,
  INITIAL_CHAOS_HISTORY,
  SASSY_FOURTH_WALL_AXIOMS,
} from '../services/beepOperatingSystem';
import { sounds } from '../utils/soundEffects';

export function useBeepOS(onNotify?: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void) {
  const [streams, setStreams] = useState<ValueStream[]>(INITIAL_VALUE_STREAMS);
  const [signals, setSignals] = useState<MarketWeakSignal[]>(INITIAL_WEAK_SIGNALS);
  const [maneuvers, setManeuvers] = useState<AnticipatoryManeuver[]>(INITIAL_ANTICIPATORY_MANEUVERS);
  const [chaosHistory, setChaosHistory] = useState<ChaosEventRecord[]>(INITIAL_CHAOS_HISTORY);
  const [isSelfOrganizing, setIsSelfOrganizing] = useState(false);
  const [activeRebalanceMode, setActiveRebalanceMode] = useState<'BALANCED' | 'GROWTH_SURGE' | 'SHOCK_FORTRESS' | 'HYPER_YIELD'>('BALANCED');
  const [sassyIndex, setSassyIndex] = useState(0);
  const [godModeUnlocked, setGodModeUnlocked] = useState(false);
  const [activeChaosShock, setActiveChaosShock] = useState<ChaosStressScenario | null>(null);
  const [chaosCountdown, setChaosCountdown] = useState<number | null>(null);

  const totalCapitalManaged = streams.reduce((acc, s) => acc + s.capital.xiAllocated, 0);
  const avgPhi = Number((streams.reduce((acc, s) => acc + s.antifragilityPhi, 0) / streams.length).toFixed(2));
  const totalAutonomousExecutions = streams.reduce((acc, s) => acc + s.autonomousExecutionsCount, 0);

  // Cycle sassy axioms periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setSassyIndex(prev => (prev + 1) % SASSY_FOURTH_WALL_AXIOMS.length);
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Trigger Dynamic Self-Organization across talent, capital, and tech conduits!
   */
  const triggerSelfOrganization = useCallback((mode: 'BALANCED' | 'GROWTH_SURGE' | 'SHOCK_FORTRESS' | 'HYPER_YIELD' = 'GROWTH_SURGE') => {
    setIsSelfOrganizing(true);
    setActiveRebalanceMode(mode);
    sounds.playGlassThrum();

    onNotify?.(`BEEP: Initiating dynamic self-organization under ${mode} protocol...`, 'info');

    // Simulate real-time biological re-clustering & liquidity reallocation
    setTimeout(() => {
      setStreams(prev =>
        prev.map(stream => {
          let capitalDelta = 0;
          let swarmDelta = 0;
          let phiDelta = 0.05;

          if (mode === 'GROWTH_SURGE') {
            if (stream.id === 'vs-gtm-domination') {
              capitalDelta = +25000;
              swarmDelta = +3;
              phiDelta = 0.12;
            } else if (stream.id === 'vs-anticipatory-innovation') {
              capitalDelta = +15000;
              swarmDelta = +2;
              phiDelta = 0.08;
            } else {
              capitalDelta = -20000;
              swarmDelta = -1;
            }
          } else if (mode === 'SHOCK_FORTRESS') {
            if (stream.id === 'vs-antifragile-treasury') {
              capitalDelta = +45000;
              swarmDelta = +4;
              phiDelta = 0.22;
            } else if (stream.id === 'vs-ecosystem-orchestration') {
              capitalDelta = +15000;
              swarmDelta = +2;
            } else {
              capitalDelta = -30000;
              swarmDelta = -2;
            }
          } else if (mode === 'HYPER_YIELD') {
            if (stream.id === 'vs-antifragile-treasury' || stream.id === 'vs-anticipatory-innovation') {
              capitalDelta = +20000;
              swarmDelta = +2;
              phiDelta = 0.15;
            }
          }

          return {
            ...stream,
            status: 'Surging',
            antifragilityPhi: Number((stream.antifragilityPhi + phiDelta).toFixed(2)),
            lastRebalanced: 'Just now',
            autonomousExecutionsCount: stream.autonomousExecutionsCount + Math.floor(Math.random() * 40 + 10),
            talent: {
              ...stream.talent,
              agentSwarmCount: Math.max(3, stream.talent.agentSwarmCount + swarmDelta),
              cognitiveLoadPct: Math.min(85, Math.max(20, stream.talent.cognitiveLoadPct + Math.floor(Math.random() * 10 - 5))),
            },
            capital: {
              ...stream.capital,
              xiAllocated: Math.max(20000, stream.capital.xiAllocated + capitalDelta),
              realizedRoiMultiplier: Number((stream.capital.realizedRoiMultiplier + 0.15).toFixed(1)),
            },
          };
        })
      );

      setIsSelfOrganizing(false);
      sounds.playSuccessHarmonic();
      onNotify?.(`BEEP: Value streams dynamically converged. System Antifragility expanded to ${(avgPhi + 0.08).toFixed(2)}Φ.`, 'success');
    }, 1200);
  }, [avgPhi, onNotify]);

  /**
   * Execute an Anticipatory Market Maneuver
   */
  const executeManeuver = useCallback((maneuverId: string) => {
    sounds.playGlassThrum();
    setManeuvers(prev =>
      prev.map(m => (m.id === maneuverId ? { ...m, status: 'DEPLOYED' } : m))
    );

    const maneuver = maneuvers.find(m => m.id === maneuverId);
    if (!maneuver) return;

    onNotify?.(`BEEP: Deployed anticipatory maneuver "${maneuver.title}". Market probers active.`, 'info');

    // Simulate completion with payoff and sound
    setTimeout(() => {
      setManeuvers(prev =>
        prev.map(m => (m.id === maneuverId ? { ...m, status: 'COMPLETED' } : m))
      );
      setStreams(prev =>
        prev.map(s => {
          if (s.id === maneuver.targetStreamId) {
            return {
              ...s,
              autonomousExecutionsCount: s.autonomousExecutionsCount + 85,
              capital: {
                ...s.capital,
                xiAllocated: s.capital.xiAllocated + Math.floor(maneuver.capitalCommitmentXi * 0.4),
              },
            };
          }
          return s;
        })
      );
      sounds.playSuccessHarmonic();
      onNotify?.(`BEEP: Maneuver completed with ${maneuver.expectedAlphaMultiplier}x alpha payoff! Competitor moat neutralized.`, 'success');
    }, 2400);
  }, [maneuvers, onNotify]);

  /**
   * Inject Controlled Chaos to test and prove Antifragility
   */
  const injectChaosStress = useCallback((scenario: ChaosStressScenario) => {
    sounds.playErrorHum();
    setActiveChaosShock(scenario);
    setChaosCountdown(scenario.autoReboundTimeSec);

    onNotify?.(`CRITICAL DRILL: Injecting "${scenario.name}". Testing Antifragile resilience...`, 'warning');

    // Temporary stress state
    setStreams(prev =>
      prev.map(s => ({
        ...s,
        status: 'Stress-Testing',
        talent: {
          ...s.talent,
          cognitiveLoadPct: Math.min(95, s.talent.cognitiveLoadPct + 25),
        },
      }))
    );

    // Countdown timer for auto-rebound
    let timeLeft = scenario.autoReboundTimeSec;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setChaosCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setActiveChaosShock(null);
        setChaosCountdown(null);

        // Calculate gain from disorder
        const profitGain = Math.floor(scenario.disorderDeltaPct * 650 * scenario.antifragileGainFactor);
        const newPhi = Number((avgPhi * 1.06).toFixed(2));

        const record: ChaosEventRecord = {
          id: `ch-${Date.now()}`,
          timestamp: 'Just now',
          scenarioName: scenario.name,
          intensity: scenario.intensity,
          initialShockDelta: `-${scenario.disorderDeltaPct}% stress`,
          reboundGainXi: profitGain,
          phiResult: newPhi,
          resolutionStatus: 'ABSORBED_WITH_PROFIT',
          note: `Autonomous shock absorption complete in ${scenario.autoReboundTimeSec}s. Reaped +${profitGain.toLocaleString()} Ξ in counter-cyclical arbitrage.`,
        };

        setChaosHistory(prev => [record, ...prev]);

        // Rebound streams stronger than before!
        setStreams(prev =>
          prev.map(s => ({
            ...s,
            status: 'Active',
            antifragilityPhi: Number((s.antifragilityPhi * 1.05).toFixed(2)),
            resonanceScore: Math.min(100, s.resonanceScore + 2),
            capital: {
              ...s.capital,
              xiAllocated: s.capital.xiAllocated + Math.floor(profitGain / prev.length),
              hedgedMarginPct: Math.min(99, s.capital.hedgedMarginPct + 2),
            },
            talent: {
              ...s.talent,
              cognitiveLoadPct: Math.max(25, s.talent.cognitiveLoadPct - 30),
            },
          }))
        );

        sounds.playSuccessHarmonic();
        onNotify?.(`ANTIFRAGILITY CONFIRMED: Shock completely absorbed! Generated +${profitGain.toLocaleString()} Ξ disorder bounty.`, 'success');
      }
    }, 1000);
  }, [avgPhi, onNotify]);

  /**
   * Unlock God Mode / Quantum Transcendence easter egg!
   */
  const triggerEasterEgg = useCallback(() => {
    sounds.playTranscendentFanfare();
    setGodModeUnlocked(true);
    onNotify?.('✨ GOD MODE UNLOCKED: BEEP has achieved Sovereign Omnipresence. All value streams operating at ∞ resonance.', 'success');
    setStreams(prev =>
      prev.map(s => ({
        ...s,
        resonanceScore: 100,
        antifragilityPhi: 3.14,
        status: 'Surging',
      }))
    );
  }, [onNotify]);

  return {
    streams,
    signals,
    maneuvers,
    chaosHistory,
    isSelfOrganizing,
    activeRebalanceMode,
    totalCapitalManaged,
    avgPhi,
    totalAutonomousExecutions,
    sassyAxiom: SASSY_FOURTH_WALL_AXIOMS[sassyIndex],
    godModeUnlocked,
    activeChaosShock,
    chaosCountdown,
    triggerSelfOrganization,
    executeManeuver,
    injectChaosStress,
    triggerEasterEgg,
  };
}
