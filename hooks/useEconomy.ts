
/**
 * @file hooks/useEconomy.ts
 * @description A custom hook to fetch and subscribe to the Syndicate's economic data (Xi Economy).
 * Connects the Financial Module's data stream to the MainView VitalsHUD.
 */

import { useState, useEffect } from 'react';
import { fetchEconomyData, type XiFlowData } from '../services/xiEconomyService';

export const useEconomy = () => {
    const [economyData, setEconomyData] = useState<XiFlowData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                const data = await fetchEconomyData();
                if (mounted) {
                    setEconomyData(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to load economy data", error);
                if (mounted) setIsLoading(false);
            }
        };

        loadData();

        // SILENCED: Poll for updates every 60 seconds (was 30s)
        const interval = setInterval(loadData, 60000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return { economyData, isLoading };
};
