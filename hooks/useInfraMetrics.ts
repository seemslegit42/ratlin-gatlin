
/**
 * @file hooks/useInfraMetrics.ts
 * @description Hook to subscribe to real-time system performance and AI telemetry.
 */

import { useState, useEffect } from 'react';
import { telemetry } from '../services/telemetryService';
import type { InfraMetric, TelemetryEvent } from '../types';

export const useInfraMetrics = () => {
    const [metrics, setMetrics] = useState<InfraMetric>(telemetry.getMetrics());
    const [events, setEvents] = useState<TelemetryEvent[]>(telemetry.getRecentEvents());

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(telemetry.getMetrics());
            setEvents(telemetry.getRecentEvents());
        }, 1000); // UI Heartbeat

        return () => clearInterval(interval);
    }, []);

    return { metrics, events };
};
