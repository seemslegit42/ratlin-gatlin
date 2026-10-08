
/**
 * @file components/marketing/CampaignTable.tsx
 * @description Displays a list of active and past marketing campaigns with performance stats.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';

export const CampaignTable: React.FC = () => {
    const campaigns = [
        { id: 1, name: 'Summer Solstice Sale', status: 'Active', reach: '1.2M', engagement: '4.5%', roas: '3.2x' },
        { id: 2, name: 'Brand Awareness Q3', status: 'Scheduled', reach: '-', engagement: '-', roas: '-' },
        { id: 3, name: 'Loyalty Program Launch', status: 'Completed', reach: '850k', engagement: '6.2%', roas: '4.5x' },
    ];

    return (
        <ModuleCard title="Campaign Performance" className="lg:col-span-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-text-tertiary border-b border-white/10">
                            <th className="pb-3 pl-2">Campaign Name</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Reach</th>
                            <th className="pb-3">Eng.</th>
                            <th className="pb-3 text-right pr-2">ROAS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {campaigns.map(camp => (
                            <tr key={camp.id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-3 pl-2 font-bold text-vitreous-white">{camp.name}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                                        camp.status === 'Active' ? 'bg-patina-green/20 text-patina-green' :
                                        camp.status === 'Scheduled' ? 'bg-yellow-500/20 text-yellow-500' :
                                        'bg-white/10 text-text-tertiary'
                                    }`}>
                                        {camp.status}
                                    </span>
                                </td>
                                <td className="py-3 text-text-secondary">{camp.reach}</td>
                                <td className="py-3 text-text-secondary">{camp.engagement}</td>
                                <td className="py-3 text-right pr-2 text-purple-400 font-mono">{camp.roas}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ModuleCard>
    );
};
