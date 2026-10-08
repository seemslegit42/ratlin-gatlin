
/**
 * @file components/widgets/SecurityAlertWidget.tsx
 * @description Displays a high-priority security alert with actionable responses.
 */

import React, { useState } from 'react';
import type { SecurityAlertWidgetData } from '../../types';
import { ShieldIcon, LockIcon } from '../icons/SecurityIcons';

interface SecurityAlertWidgetProps {
  data: SecurityAlertWidgetData;
  onInteraction?: (cmd: string) => void;
}

const SecurityAlertWidget: React.FC<SecurityAlertWidgetProps> = ({ data, onInteraction }) => {
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setActionTaken(action);
    if (onInteraction) {
      onInteraction(`Take security action: ${action} for alert "${data.alertTitle}"`);
    }
  };

  const isCritical = data.severity === 'Critical' || data.severity === 'High';
  const colorClass = isCritical ? 'text-red-500' : 'text-yellow-400';
  const bgClass = isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-400/10 border-yellow-400/30';

  return (
    <div className={`backdrop-blur-xl border rounded-xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full max-w-sm ${bgClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-black/40 ${colorClass} animate-pulse`}>
            <ShieldIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`font-comfortaa font-bold text-lg ${colorClass}`}>SECURITY ALERT</h4>
            <p className="text-xs text-vitreous-white font-mono uppercase tracking-wider">{data.severity} Priority</p>
          </div>
        </div>
        <span className="text-[10px] text-text-tertiary font-mono">{data.timestamp}</span>
      </div>

      <h5 className="text-sm font-bold text-white mb-2">{data.alertTitle}</h5>
      <p className="text-xs text-text-secondary leading-relaxed mb-4">
        {data.description}
      </p>

      <div className="p-3 bg-black/40 rounded-lg border border-white/5 mb-4">
        <span className="text-[10px] text-text-tertiary uppercase font-bold block mb-1">Recommendation</span>
        <p className="text-xs text-white">{data.recommendedAction}</p>
      </div>

      {actionTaken ? (
        <div className="w-full py-2 bg-black/60 text-text-secondary border border-white/10 rounded-lg text-xs font-mono text-center">
          ACTION LOGGED: {actionTaken.toUpperCase()}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction('Account Locked')}
            className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <LockIcon className="w-3 h-3" />
            <span>Lock Account</span>
          </button>
          <button 
            onClick={() => handleAction('Alert Dismissed')}
            className="py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold transition-colors"
          >
            Dismiss
          </button>
          <button 
            onClick={() => handleAction('Details Viewed')}
            className="col-span-2 py-2 text-[10px] text-text-tertiary hover:text-white transition-colors"
          >
            View Full Forensic Log
          </button>
        </div>
      )}
    </div>
  );
};

export default SecurityAlertWidget;
