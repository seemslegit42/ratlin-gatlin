/**
 * @file hooks/useChaosEconomy.ts
 * @description Manages the lifecycle of active Chaos Effects and card procurement.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChaosCard, ActiveChaosEffect, CurrentUser } from '../types.js';
import { tablesDB, DATABASE_ID, TABLES } from '../services/appwriteClient.js';
import { useNotifications } from '../contexts/NotificationContext.js';
import { nanoid } from 'nanoid';

export const useChaosEconomy = (currentUser: CurrentUser | null, onXiUpdate: (amount: number) => void) => {
    const [activeEffects, setActiveEffects] = useState<ActiveChaosEffect[]>([]);
    const { addNotification } = useNotifications();
    const prevCountRef = useRef(0);

    // Cleanup expired effects
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setActiveEffects(prev => {
                const filtered = prev.filter(e => e.endTime > now);
                if (filtered.length < prevCountRef.current) {
                    addNotification("A Chaos Effect has dissolved. Reality stabilized.", "info");
                }
                prevCountRef.current = filtered.length;
                return filtered;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [addNotification]);

    const activateCard = useCallback(async (card: ChaosCard) => {
        if (!currentUser) return;
        
        if (currentUser.xiBalance < card.cost) {
            addNotification("Insufficient Ξ resources to manifest this chaos.", "error");
            return;
        }

        // Atomically deduct Ξ
        onXiUpdate(-card.cost);
        
        const now = Date.now();
        const newEffect: ActiveChaosEffect = {
            cardId: card.id,
            startTime: now,
            endTime: now + (card.duration * 1000),
            visualKey: card.visualKey
        };

        setActiveEffects(prev => [...prev, newEffect]);
        prevCountRef.current = activeEffects.length + 1;
        
        addNotification(`${card.name} manifested. Protocol: ${card.class}`, "success");

        // Log to chronicle
        try {
            await tablesDB.createRow(DATABASE_ID, TABLES.CHRONICLE_EVENTS, nanoid(), {
                syndicate_id: currentUser.syndicateId,
                type: 'SYSTEM',
                source: 'CHAOS_DECK',
                message: `Sovereign triggered ${card.name}. System variance increased.`,
                timestamp: now
            });
        } catch (error) {
            console.error("Failed to log chaos event to chronicle:", error);
        }
    }, [currentUser, onXiUpdate, addNotification, activeEffects.length]);

    return {
        activeEffects,
        activateCard
    };
};
