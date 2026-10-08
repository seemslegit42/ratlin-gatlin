/**
 * @file components/widgets/OnboardingWidget.tsx
 * @description Displays an onboarding status widget for a new contractor.
 * It provides a quick overview of their clearance, payroll, and NDA status.
 */

import React, { memo } from 'react';
import type { OnboardingWidgetData } from '../../types.js';

/**
 * Props for the OnboardingWidget component.
 * @interface
 */
interface OnboardingWidgetProps {
  /** The data to display within the onboarding widget. */
  data: OnboardingWidgetData;
}

/**
 * Props for the StatusIndicator component.
 * @interface
 */
interface StatusIndicatorProps {
  /** The label for the status (e.g., "Clearance"). */
  label: string;
  /** The current status (e.g., "PENDING", "ACTIVE"). */
  status: string;
}

/**
 * Renders a single status indicator row within the onboarding widget.
 * It shows a label and a styled status badge.
 * @param {StatusIndicatorProps} props - The component props.
 * @returns {React.FC} The StatusIndicator UI.
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = memo(({ label, status }) => {
    const isComplete = ['ACTIVE', 'PAID', 'GRANTED'].includes(status);
    // const isPending = ['PENDING', 'SCHEDULED'].includes(status); // Added for potential future styling
    
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-xs text-text-secondary">{label}</span>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isComplete ? 'bg-patina-green/10 text-patina-green border-patina-green/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                {status}
            </div>
        </div>
    );
});
StatusIndicator.displayName = 'StatusIndicator';

/**
 * The OnboardingWidget component.
 * Displays a contractor's onboarding status with an abstract avatar and key status indicators.
 * Features Agentic HR (Cocaine Pam) dispatch, interactive completion transition, and glowing green state.
 */
const OnboardingWidget: React.FC<OnboardingWidgetProps> = memo(({ data }) => {
  const [isCompleted, setIsCompleted] = React.useState(
    data.accessStatus === 'GRANTED' || data.payrollStatus === 'ACTIVE'
  );

  // Auto transition to complete after brief delay if initialized pending
  React.useEffect(() => {
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsCompleted(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  const accessText = isCompleted ? 'GRANTED (Tier 2 Genesis Assets)' : (data.accessStatus || 'PENDING');
  const payrollText = isCompleted ? 'ACTIVE ($5,000 USD 1st/15th)' : (data.payrollStatus || 'SCHEDULED');

  return (
    <div
      onClick={() => setIsCompleted(prev => !prev)}
      className={`rounded-2xl border transition-all duration-700 overflow-hidden w-full max-w-sm cursor-pointer select-none ${
        isCompleted
          ? 'bg-panel-bg/90 border-patina-green shadow-[0_0_30px_rgba(62,185,145,0.35)]'
          : 'bg-panel-bg/60 border-glass-border shadow-glass'
      }`}
    >
      <div className={`h-1.5 transition-colors duration-500 ${
        isCompleted ? 'bg-gradient-to-r from-patina-green via-roman-aqua to-patina-green' : 'bg-gradient-to-r from-imperial-purple via-yellow-400 to-patina-green'
      }`} />
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-3 text-[9px] font-mono">
            <span className="text-text-tertiary uppercase tracking-widest flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-patina-green animate-pulse' : 'bg-yellow-400 animate-pulse'}`} />
                DISPATCHED BY: COCAINE PAM (HR AGENT)
            </span>
            <span className={`font-bold ${isCompleted ? 'text-patina-green' : 'text-yellow-400'}`}>
                {isCompleted ? 'STATUS: ACTIVE' : 'STATUS: PROVISIONAL'}
            </span>
        </div>

        <div className="flex items-center space-x-3.5 mb-4">
            <div className={`relative w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden transition-all ${
              isCompleted ? 'bg-patina-green/10 border-patina-green/40 text-patina-green' : 'bg-white/5 border-white/10 text-roman-aqua'
            }`}>
                <svg className="w-6 h-6 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {isCompleted && (
                  <div className="absolute inset-0 bg-patina-green/20 mix-blend-overlay animate-pulse" />
                )}
            </div>
            <div>
                <h4 className="font-comfortaa font-bold text-vitreous-white text-base leading-tight">{data.contractorName}</h4>
                <p className="text-[10px] text-text-tertiary font-mono">Freelance Contractor · Project Genesis</p>
            </div>
        </div>

        <div className="bg-black/30 rounded-xl p-3 space-y-1.5 border border-white/5">
            <StatusIndicator label="Clearance" status={accessText} />
            <StatusIndicator label="Payroll" status={payrollText} />
            <StatusIndicator label="Contract" status="STANDARD FREELANCE (EXECUTED)" />
            <StatusIndicator label="Portal" status={isCompleted ? 'SUBMITTED & VERIFIED' : 'DISPATCHED'} />
        </div>

        <div className={`mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono transition-colors ${
          isCompleted ? 'text-patina-green' : 'text-text-tertiary'
        }`}>
            <span>{isCompleted ? '✓ FULLY ONBOARDED · ASSETS UNLOCKED' : 'Tap card to toggle verification state'}</span>
            <span className="text-[9px] uppercase tracking-wider">{isCompleted ? 'READY' : 'WAITING'}</span>
        </div>
      </div>
    </div>
  );
});
OnboardingWidget.displayName = 'OnboardingWidget';

export default OnboardingWidget;