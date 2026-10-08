/**
 * @file services/telemetryService.ts
 * @description Tracks system-wide backend performance, AI efficacy, and resource utilization.
 */

import { nanoid } from 'nanoid';
import type { TelemetryEvent, InfraMetric } from '../types';

class TelemetryService {
    private events: TelemetryEvent[] = [];
    private maxEvents = 100;

    /**
     * Records a significant backend or AI event.
     */
    record(type: TelemetryEvent['type'], duration: number, status: TelemetryEvent['status'], metadata: any = {}) {
        const event: TelemetryEvent = {
            id: nanoid(),
            timestamp: Date.now(),
            type,
            duration,
            status,
            metadata
        };

        this.events.push(event);
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        console.debug(`[ΛΞVOS_TELEMETRY] ${type} -> ${status} (${duration}ms)`);
    }

    /**
     * Calculates current infrastructure health metrics.
     */
    getMetrics(): InfraMetric {
        const recent = this.events.slice(-20);
        if (recent.length === 0) {
            return {
                latency: 0,
                throughput: 0,
                errorRate: 0,
                neuralLoad: 12,
                activeNodes: 0,
                totalTokens: 0,
                costEstimate: 0
            };
        }

        const avgLatency = recent.reduce((acc, e) => acc + e.duration, 0) / recent.length;
        const errors = recent.filter(e => e.status === 'FAILURE').length;
        const errorRate = (errors / recent.length) * 100;
        
        // Cumulative stats
        /* Fix: Cast metadata tokens to number to satisfy arithmetic operation */
        const totalTokens = this.events.reduce((acc, e) => acc + ((e.metadata?.tokens as number) || 0), 0);
        
        return {
            latency: Math.round(avgLatency),
            throughput: recent.length, // Events per sliding window
            errorRate,
            neuralLoad: Math.min(100, 15 + (recent.length * 2)),
            activeNodes: new Set(this.events.map(e => e.metadata?.nodeId).filter(Boolean)).size,
            totalTokens,
            costEstimate: totalTokens * 0.00002 // Arbitrary unit cost
        };
    }

    getRecentEvents() {
        return [...this.events].reverse();
    }

    /**
     * Drops oldest telemetry events beyond the configured cap.
     * @returns Number of events removed.
     */
    pruneOldEvents(max = this.maxEvents): number {
        const overflow = this.events.length - max;
        if (overflow <= 0) return 0;
        this.events.splice(0, overflow);
        return overflow;
    }
}

export const telemetry = new TelemetryService();