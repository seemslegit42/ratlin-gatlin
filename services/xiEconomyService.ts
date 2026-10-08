
/**
 * @file services/xiEconomyService.ts
 * @description The Obelisk Treasury Protocol core. 
 * Orchestrates value transmutation, RTR (Retained Tribute Ratio) controls, 
 * and CogniOps metering.
 */
import { nanoid } from 'nanoid';
import type { TreasuryTransaction, EconomyGovernance, PactTier } from '../types';

export interface XiFlowData {
    inputs: {
        subscriptions: number;
        overage: number;
    };
    platformTithe: number;
    syndicateNetFiat: number;
    internalValueGen: number;
    treasury: {
        balance: number;
        accrualRate: number; // percentage
    };
    outputs: {
        cogniOps: number; // CogniOps consumption
        poaRewards: number; // Proof of Attribution rewards
    };
    governance: EconomyGovernance;
}

export interface COGSComponent {
    id: string;
    name: string;
    metric: string;
    cost: number; // Normalized cost
    weight: number; // Impact weight
    color: string;
}

/**
 * PACT_CONFIGS
 * Defines the gating for the three canonical subscription tiers.
 */
export const PACT_CONFIGS: Record<PactTier, { opsLimit: number; price: number; features: string[] }> = {
    'Apprentice': {
        opsLimit: 100,
        price: 0,
        features: ['Core Cockpit', 'Basic Weaver', 'Public Shards']
    },
    'Artisan': {
        opsLimit: 2000,
        price: 20,
        features: ['Full Armory Access', 'Loom Studio', 'Overage Protection', 'Multiplayer Sync']
    },
    'Priesthood': {
        opsLimit: 50000, // Effectively "High Volume"
        price: 500,
        features: ['AEGIS Guardian Suite', 'Dedicated Neural Root', 'SSO/Audit Log', 'Sovereign Sigil (Black Card)']
    }
};

/**
 * Fetches the global economy state.
 * In a real app, this pulls from the /syndicates/economy table.
 */
export const fetchEconomyData = async (): Promise<XiFlowData> => {
    // Simulate internal API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const subscriptions = 45000;
    const overage = 12500;
    const totalFiatIn = subscriptions + overage;
    const tithe = totalFiatIn * 0.18; // 18% "Transmutation Tithe"
    const stripeFee = totalFiatIn * 0.029 + 0.30;
    const syndicateNet = totalFiatIn - tithe - stripeFee;

    const internalValueGen = 88000; 
    const treasuryAccrual = internalValueGen * 0.5;
    const subscriptionPayment = 32000; // Value of consumed CogniOps

    return {
        inputs: {
            subscriptions,
            overage,
        },
        platformTithe: tithe,
        syndicateNetFiat: syndicateNet,
        internalValueGen: internalValueGen,
        treasury: {
            balance: treasuryAccrual - subscriptionPayment + 150000, 
            accrualRate: 0.5,
        },
        outputs: {
            cogniOps: subscriptionPayment,
            poaRewards: internalValueGen * 0.5,
        },
        governance: {
            baseRTR: 0.18,
            pityBoonThreshold: 3, // 3 losses triggers a minor boon
            transmutationTithe: 0.18,
            tributeVelocity: 42.8 // Xi spent per minute in this cycle
        }
    };
};

export const fetchTreasuryTransactions = async (): Promise<TreasuryTransaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transactions: TreasuryTransaction[] = [
        { id: nanoid(), type: 'debit', description: 'CogniOps Consumption (Swarm v2.1)', amount: -3200, timestamp: Date.now() - 86400000 * 1 },
        { id: nanoid(), type: 'accrual', description: 'Instruments of Folly Accrual (Cycle 42)', amount: 4400, timestamp: Date.now() - 86400000 * 2 },
        { id: nanoid(), type: 'transmutation', description: 'Sigil Transaction: Alpha Server Payout', amount: -15000, timestamp: Date.now() - 86400000 * 5 },
        { id: nanoid(), type: 'accrual', description: 'Syndicate Genesis Grant', amount: 100000, timestamp: Date.now() - 86400000 * 60 },
    ];
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

export const fetchCOGSBreakdown = (): COGSComponent[] => {
    return [
        { id: 'gpu', name: 'Infrastructure (GPU)', metric: 'Normalized TFLOPS', cost: 0.045, weight: 0.45, color: '#3EB991' },
        { id: 'inference', name: 'Agent Reasoning', metric: 'CogniOps Density', cost: 0.025, weight: 0.35, color: '#20B2AA' },
        { id: 'memory', name: 'Context Retention', metric: 'PAC Storage (MB)', cost: 0.015, weight: 0.15, color: '#6A0DAD' },
        { id: 'safety', name: 'AEGIS Alignment', metric: 'Guardrail Latency', cost: 0.005, weight: 0.05, color: '#FACC15' },
    ];
};