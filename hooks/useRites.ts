/**
 * @file hooks/useRites.ts
 * @description The Agentic Ritual Engine (ARE) hook.
 * Monitors Sovereign state and controls the manifestation of Rites.
 */

import { useState, useEffect, useCallback } from 'react';
import type { PillarOfEternity, RiteType } from '../types';
import { fetchPillarState, judgeFolly, completeBurnoutFuneral } from '../services/ritesService';
import { useAuth } from '../contexts/AuthContext';

export const useRites = () => {
    const { currentUser } = useAuth();
    const [pillar, setPillar] = useState<PillarOfEternity | null>(null);
    const [activeRite, setActiveRite] = useState<RiteType | null>(null);
    const [follyTriggered, setFollyTriggered] = useState(false);
    
    // Polling / Sync
    const syncPillar = useCallback(async () => {
        if (!currentUser) return;
        const data = await fetchPillarState(currentUser.id);
        setPillar(data);
    }, [currentUser]);

    useEffect(() => {
        void syncPillar();
    }, [syncPillar]);

    // Simulating "Doomscrolling" Detection via Aegis
    // In a real app, this would track scroll events or tab switching frequency.
    // Here, we expose a manual trigger for the "Demiurge" or random chance.
    const triggerFollyInterdiction = useCallback(() => {
        if (pillar?.psycheMatrixState === 'Harried') {
            setFollyTriggered(true);
            setActiveRite('FOLLY_INTERDICTION' as RiteType);
        }
    }, [pillar]);

    const handleAcknowledgeFolly = useCallback(async (duration: number) => {
        if (!currentUser) return;
        const result = await judgeFolly(currentUser.id, duration);
        setFollyTriggered(false);
        setActiveRite(null);
        await syncPillar();
        return result;
    }, [currentUser, syncPillar]);

    const handleBeginFuneral = useCallback(() => {
        setActiveRite('BURNOUT_FUNERAL' as RiteType);
    }, []);

    const handleCompleteFuneral = useCallback(async () => {
        if (!currentUser) return;
        await completeBurnoutFuneral(currentUser.id);
        setActiveRite(null);
        await syncPillar();
    }, [currentUser, syncPillar]);

    // Persona Logic
    const getActivePersonaModule = () => {
        if (activeRite === 'FOLLY_INTERDICTION') return 'ScionOfShame';
        if (activeRite === 'BURNOUT_FUNERAL') return 'Eulogist';
        return null;
    };

    return {
        pillar,
        activeRite,
        follyTriggered,
        triggerFollyInterdiction,
        handleAcknowledgeFolly,
        handleBeginFuneral,
        handleCompleteFuneral,
        activePersona: getActivePersonaModule()
    };
};
