/**
 * @file hooks/useFileManagement.ts
 * @description React integration for periodic and event-driven file / storage hygiene.
 */

import { useEffect, useRef } from 'react';
import {
  configureFileManagement,
  resolveFileManagementConfig,
  runFileManagementCycle,
} from '../services/fileManagementService.js';
import type { FileManagementTrigger } from '../services/fileManagementTypes.js';

export interface UseFileManagementOptions {
  syndicateId?: string | null;
  /** When true, runs authenticated cycles (chronicle pruning) and post-workflow sweeps. */
  active?: boolean;
}

/**
 * Wires file-management to auth lifecycle: bootstrap on mount, interval + visibility,
 * and syndicate-scoped chronicle pruning when `active` is true.
 */
export function useFileManagement({ syndicateId, active = false }: UseFileManagementOptions): void {
  const syndicateRef = useRef(syndicateId);
  syndicateRef.current = syndicateId ?? undefined;

  useEffect(() => {
    configureFileManagement(resolveFileManagementConfig());
  }, []);

  useEffect(() => {
    if (!active || !syndicateId) return;

    void runFileManagementCycle({
      trigger: 'bootstrap',
      syndicateId,
    });
  }, [active, syndicateId]);

  useEffect(() => {
    if (!active) return;

    const onWorkflowComplete = () => {
      void runFileManagementCycle({
        trigger: 'workflow_complete',
        syndicateId: syndicateRef.current,
      });
    };

    window.addEventListener('levon:workflow-complete', onWorkflowComplete);
    return () => window.removeEventListener('levon:workflow-complete', onWorkflowComplete);
  }, [active]);
}

/** Dispatches a workflow-complete hygiene event (call after swarm execution). */
export function dispatchWorkflowCompleteHygiene(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('levon:workflow-complete'));
}

/** Runs a one-off hygiene pass (e.g. logout). */
export function runFileManagementNow(
  trigger: FileManagementTrigger,
  syndicateId?: string,
  releaseLlmCache = false,
): void {
  void runFileManagementCycle({ trigger, syndicateId, releaseLlmCache });
}
