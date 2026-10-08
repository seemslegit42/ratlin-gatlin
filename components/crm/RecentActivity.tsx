
/**
 * @file components/crm/RecentActivity.tsx
 * @description Displays a timeline of recent CRM activities.
 */

import React from 'react';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ZapIcon } from '../icons/QuickActionIcons';
import type { CRMActivity } from '../../types';

interface RecentActivityProps {
    activities: CRMActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  
  return (
    <ModuleCard title="Recent Activity" icon={<ZapIcon className="w-5 h-5 text-yellow-400" />}>
      <div className="space-y-0 relative max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {/* Vertical Timeline Line */}
        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-white/10" />

        {activities.length === 0 ? (
             <div className="pl-6 text-sm text-text-tertiary">No recent activity recorded.</div>
        ) : (
            activities.map((act) => (
            <div key={act.id} className="relative pl-6 pb-6 last:pb-0">
                <div className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full ${act.color} ring-4 ring-black`} />
                <p className="text-sm text-vitreous-white leading-snug">
                <span className="font-bold">{act.user}</span> {act.action} <span className="font-bold text-roman-aqua">{act.target}</span> regarding {act.topic}.
                </p>
                <p className="text-xs text-text-tertiary mt-1">{act.time}</p>
            </div>
            ))
        )}
      </div>
    </ModuleCard>
  );
};
