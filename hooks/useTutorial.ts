/**
 * @file hooks/useTutorial.ts
 * @description Manages the diegetic onboarding walkthrough for the Weaver Studio.
 * Synchronizes completion state with Appwrite's user metadata.
 */

import { useState, useCallback, useEffect } from 'react';
import { tablesDB, DATABASE_ID, TABLES } from '../services/appwriteClient.js';
import type { CurrentUser } from '../types.js';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
}

const WEAVER_TUTORIAL: TutorialStep[] = [
  {
    id: '0',
    title: 'Architect Protocol',
    message: 'Weaver Studio initialized. Your intent has been synthesized into a live logical topology. Observe the node structure.',
    position: { top: '20%', left: '50%' }
  },
  {
    id: '1',
    title: 'Inspect & Configure',
    message: 'Select any Node to access its "Inspector Panel". Here you can calibrate prompts, adjust models, and fine-tune logic gates.',
    position: { top: '45%', left: '50%' }
  },
  {
    id: '2',
    title: 'Execute Swarm',
    message: 'When ready, engage the "Execute Swarm" protocol below. The system will sequentially activate the neural lattice.',
    position: { bottom: '160px', left: '50%' }
  },
];

export const useTutorial = (currentUser: CurrentUser | null) => {
  const [hasCompleted, setHasCompleted] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  // Sync initial state from User profile
  useEffect(() => {
    if (currentUser) {
        setHasCompleted(currentUser.hasOnboarded);
    }
  }, [currentUser?.hasOnboarded]);

  const isActive = isTutorialActive && !hasCompleted && currentStepIndex < WEAVER_TUTORIAL.length;
  const currentStep = isActive ? WEAVER_TUTORIAL[currentStepIndex] : null;

  const startTutorial = useCallback(() => {
    if (!hasCompleted) {
        setIsTutorialActive(true);
        setCurrentStepIndex(0);
    }
  }, [hasCompleted]);

  const nextStep = useCallback(async () => {
    if (currentStepIndex < WEAVER_TUTORIAL.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      await finishTutorial();
    }
  }, [currentStepIndex, currentUser]);

  const finishTutorial = async () => {
    setHasCompleted(true);
    setIsTutorialActive(false);
    
    if (currentUser?.id) {
        try {
            // Fetch current status to perform a safe merge
            const userData: any = await tablesDB.getRow(DATABASE_ID, TABLES.USERS, currentUser.id).catch(() => null);
              
            const currentStatus = userData?.mythic_status ? (typeof userData.mythic_status === 'string' ? JSON.parse(userData.mythic_status) : userData.mythic_status) : {};
            
            const newStatus = { 
                ...currentStatus, 
                tutorial_completed: true,
                weaver_onboarded_at: Date.now()
            };

            await tablesDB.updateRow(DATABASE_ID, TABLES.USERS, currentUser.id, {
                has_onboarded: true,
                mythic_status: JSON.stringify(newStatus)
            });
            
        } catch (err) {
            console.error("[TUTORIAL] Failed to persist completion state:", err);
        }
    }
  };

  const dismissTutorial = useCallback(async () => {
      await finishTutorial();
  }, [currentUser]);

  return {
    isActive,
    currentStep,
    nextStep,
    startTutorial,
    dismissTutorial,
    totalSteps: WEAVER_TUTORIAL.length
  };
};
