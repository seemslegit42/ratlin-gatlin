
/**
 * @file components/security/BehavioralBaselines.tsx
 * @description Monitors user behavior and trust scores.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { useAuth } from '../../contexts/AuthContext';

export const BehavioralBaselines: React.FC = () => {
    const { currentUser, syndicateId } = useAuth();

    const users = [
        {
            user: currentUser?.name || 'Sovereign Operator',
            status: 'Normal',
            score: 99,
            role: currentUser?.covenant || 'Sovereign Root',
            isSelf: true,
            id: currentUser?.id?.slice(0, 8) || 'SOV-01',
        },
        { user: 'Operator X', status: 'Review', score: 72, role: 'User', isSelf: false, id: 'USR-882' },
        { user: 'Analyst Alpha', status: 'Normal', score: 95, role: 'Analyst', isSelf: false, id: 'ANL-412' },
        { user: 'System Root', status: 'Normal', score: 99, role: 'Sentinel Daemon', isSelf: false, id: 'SYS-001' },
    ];

    return (
        <ModuleCard title="Behavioral Baselines & Zero-Trust Monitor" className="h-96">
            <div className="h-full overflow-y-auto pr-2 space-y-4 font-lexend">
                {users.map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        item.isSelf ? 'bg-imperial-purple/15 border-patina-green/40 shadow-[0_0_12px_rgba(62,185,145,0.15)]' : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}>
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                                item.isSelf ? 'bg-gradient-to-br from-imperial-purple to-patina-green' :
                                item.status === 'Review' ? 'bg-gradient-to-br from-yellow-600 to-orange-700' : 'bg-gradient-to-br from-gray-700 to-gray-900'
                            }`}>
                                {item.user[0]}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-vitreous-white flex items-center gap-2">
                                    {item.user}
                                    {item.isSelf && <span className="text-[9px] bg-patina-green/20 text-patina-green px-1.5 py-0.5 rounded font-mono">YOU</span>}
                                </div>
                                <div className="text-[10px] text-text-tertiary">{item.role} • ID: {item.id}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-bold ${item.status === 'Normal' ? 'text-patina-green' : 'text-yellow-400'}`}>{item.status}</div>
                            <div className="text-[10px] text-text-tertiary font-mono">Trust: {item.score}/100</div>
                        </div>
                    </div>
                ))}
            </div>
        </ModuleCard>
    );
};
