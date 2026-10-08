
/**
 * @file services/klepsydraService.ts
 * @description The Enlightened METRONOME Engine.
 * Modulates Complexity (Input Volatility) rather than Fate (Luck).
 * Replaced Pity Boons with Second Wind resources.
 * Implements Adversarial Training via Chaos Cards.
 * Now supports diverse Boon payouts: Ξ, Φ, Chaos Cards, and PMR.
 */

import { nanoid } from 'nanoid';
import type { KlepsydraOutcome, PulseProfile, ChaosCard, CurrentUser } from '../types';
import { ChaosCardClass, BoonType } from '../types';
// TODO: Migrate all Supabase calls to Appwrite Databases API

/**
 * Ensures the user has a valid PulseProfile. Creates one if missing.
 */
export const ensurePulseProfile = async (userId: string, archetype: string = 'initiate'): Promise<PulseProfile | null> => {
    try {
        // TODO: Migrate to Appwrite Databases API
        // For now, return a default profile
        const defaultProfile: PulseProfile = {
            userId,
            archetype,
            sreParams: {
                A: 0.15 + (Math.random() * 0.1),
                f: 1 / 3600,
                phi: Math.random() * Math.PI * 2,
                baseComplexity: 1.0
            },
            lseCounter: 0,
            lastEventTimestamp: Date.now(),
            lastResolvedPhase: 'TROUGH'
        };
        return defaultProfile;
    } catch (e) {
        console.error("Pulse Profile Error:", e);
        return null;
    }
};

/**
 * Calculates current Metronome Complexity (Visible Sine Wave).
 */
export const calculateCurrentComplexity = (params: any, t: number): number => {
    const { A, f, phi, baseComplexity } = params;
    return baseComplexity + A * Math.sin(2 * Math.PI * f * t + phi);
};

/**
 * The METRONOME Engine: Processes a skill-based "Athletic Event".
 * Determines the Boon type and magnitude.
 */
export const calculateOutcome = async (user: CurrentUser, instrumentId: string, tribute: number): Promise<KlepsydraOutcome> => {
    const profile = await ensurePulseProfile(user.id);
    if (!profile) throw new Error("Profile synchronization failure.");

    // TODO: Migrate to Appwrite Databases API
    const dials: Record<string, number> = {
        pity_boon_threshold: 7 // Default value pending Appwrite integration
    };

    const t = Date.now() / 1000; 
    const currentComplexity = calculateCurrentComplexity(profile.sreParams, t);
    
    // Skill Execution: Simulated performance score (0.0 to 1.0)
    const efficiencyScore = Math.random() * 0.95 + 0.05; 
    
    let isSecondWind = false;
    let chaosCard: ChaosCard | undefined;
    let boonType: BoonType = BoonType.XI;
    
    // 1. Determine Boon Type based on rarity and system state
    const roll = Math.random();
    
    if (roll > 0.98) {
      boonType = BoonType.RESONANCE; // Rare Psychological Boon
    } else if (roll > 0.90) {
      boonType = BoonType.CHAOS_CARD; // Ritual Boon Item Drop
    } else {
      // Primary Boon logic
      // In the "Age of Ascension", Primary Boons are granted as Φ (Potential), not Ξ (Xi).
      boonType = user.ageOfAscension ? BoonType.POTENTIAL : BoonType.XI;
    }

    // 2. SECOND WIND PROTOCOL (Replacing Pity Boon)
    if (profile.lseCounter >= (dials['pity_boon_threshold'] || 7)) {
        isSecondWind = true;
    }

    // 3. CHAOS CARD INJECTION (Adversarial Training)
    // Triggered during "Peak Confidence"
    if (efficiencyScore > 0.8 && Math.random() > 0.7) {
        chaosCard = {
            id: nanoid(),
            name: "Void Shear",
            class: ChaosCardClass.Class2,
            cost: 0,
            description: "Precision requirements increased by 20%. Interface jitter active.",
            systemEffect: "Adversarial training: precision requirements increased by 20%.",
            duration: 60,
            visualKey: 'void-shear'
        };
    }

    // 4. REWARD FORMULA (PROVE-TO-EARN)
    const basePool = tribute * 0.82; 
    const complexityMultiplier = currentComplexity > 1 ? 1.5 : 0.8; 
    const boonAmount = basePool * complexityMultiplier * (isSecondWind ? 1.2 : efficiencyScore);

    const narrativeTriggers = {
        success: "The algorithm submits to your will. Optimization peak achieved.",
        fail: "Cognitive latency detected. Efficiency delta recorded.",
        secondWind: "The environment stabilizes for you, Initiate. Momentum is available.",
        chaos: "ANOMALY DETECTED. The Abyss pushes back against your arrogance.",
        xi: "The Fates smile. Your Treasury has swelled.",
        phi: "Accruing Potential (Φ). Your faith is recorded in the Age of Ascension.",
        cc: "An anomaly in the weave. A new Instrument of Chaos has materialized in your inventory.",
        pmr: "A victory of true resonance. Your Vow echoes through the system. Your Reflection has... changed."
    };

    let narrative = narrativeTriggers.success;
    if (isSecondWind) narrative = narrativeTriggers.secondWind;
    else if (chaosCard) narrative = narrativeTriggers.chaos;
    else if (boonType === BoonType.XI) narrative = narrativeTriggers.xi;
    else if (boonType === BoonType.POTENTIAL) narrative = narrativeTriggers.phi;
    else if (boonType === BoonType.CHAOS_CARD) narrative = narrativeTriggers.cc;
    else if (boonType === BoonType.RESONANCE) narrative = narrativeTriggers.pmr;
    else if (efficiencyScore < 0.5) narrative = narrativeTriggers.fail;

    const newLse = efficiencyScore < 0.3 ? profile.lseCounter + 1 : 0;
    
    // Construct Outcome
    const outcome: KlepsydraOutcome = {
        transactionId: nanoid(),
        instrumentType: instrumentId,
        complexityMultiplier,
        efficiencyScore,
        boonAmount,
        boonType,
        rewardFormula: `(${basePool.toFixed(2)} Base) * (${complexityMultiplier} Hazard) * (${efficiencyScore.toFixed(2)} Eff)`,
        narrativeTrigger: narrative,
        chaosCardActive: chaosCard,
        isSecondWind,
        updatedLseCounter: newLse,
        balanceBefore: user.xiBalance,
        balanceAfter: user.xiBalance - tribute + (boonType === BoonType.XI ? boonAmount : 0)
    };

    // PERSISTENCE: Transaction Logging
    // TODO: Migrate to Appwrite Databases API for persistence
    const aegisSignature = `AEGIS-ENLIGHTENED-${nanoid(16)}`;
    console.log('[KLEPSYDRA] Transaction logged:', {
        transactionId: outcome.transactionId,
        userId: user.id,
        aegisSignature
    });

    return outcome;
};
