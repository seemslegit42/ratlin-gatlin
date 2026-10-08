
/**
 * @file components/security/ThreatDashboard.tsx
 * @description Displays high-level security metrics including Threat Level, Shielding, and Incidents.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { RadarIcon, ShieldIcon, EyeIcon, LockIcon } from '../icons/SecurityIcons';

export const ThreatDashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModuleCard title="Threat Level" icon={<RadarIcon className="w-6 h-6 text-red-500" />}>
                <div className="flex flex-col items-center justify-center h-24">
                    <div className="text-4xl font-bold text-red-500 animate-pulse">ELEVATED</div>
                    <div className="text-xs text-text-tertiary mt-2 uppercase tracking-widest">Defcon 3</div>
                </div>
            </ModuleCard>

            <ModuleCard title="Active Shielding" icon={<ShieldIcon className="w-6 h-6 text-patina-green" />}>
                <div className="flex flex-col justify-center h-24 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Firewall</span>
                        <span className="text-patina-green font-bold">100%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-patina-green h-full rounded-full w-full" />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Encryption</span>
                        <span className="text-patina-green font-bold">AES-256</span>
                    </div>
                </div>
            </ModuleCard>

            <ModuleCard title="Incidents (24h)" icon={<EyeIcon className="w-6 h-6 text-yellow-400" />}>
                <div className="flex items-end justify-between h-24">
                    <div className="text-5xl font-mono font-bold text-vitreous-white">3</div>
                    <div className="text-xs text-yellow-400 mb-2 font-bold">+1 vs avg</div>
                </div>
            </ModuleCard>

            <ModuleCard title="Access Policy" icon={<LockIcon className="w-6 h-6 text-roman-aqua" />}>
                <div className="flex flex-col justify-center h-24 text-center">
                    <div className="text-lg font-bold text-roman-aqua">Zero Trust</div>
                    <div className="text-xs text-text-tertiary mt-1">Biometric Re-auth Active</div>
                </div>
            </ModuleCard>
        </div>
    );
};
