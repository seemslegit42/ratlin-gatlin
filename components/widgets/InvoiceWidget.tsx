/**
 * @file components/widgets/InvoiceWidget.tsx
 * @description Displays a visually rich invoice settlement protocol widget.
 * It shows invoice details, client information, amount, and an animated "PAID" stamp
 * when the status is set to PAID. It also includes animated status steps.
 */

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import type { InvoiceWidgetData } from '../../types.js';

/**
 * Props for the InvoiceWidget component.
 * @interface
 */
interface InvoiceWidgetProps {
  /** The data to display within the invoice widget. */
  data: InvoiceWidgetData;
}

/**
 * Props for the StatusStep component.
 * @interface
 */
interface StatusStepProps {
  /** The label for the status step (e.g., "Tax Allocation"). */
  label: string;
  /** Whether the step is marked as complete. */
  complete: boolean;
  /** The delay in milliseconds before the step's animation starts. */
  delay: number;
}

/**
 * Renders an animated status step within the InvoiceWidget.
 * The step visually progresses from an incomplete to a complete state.
 * @param {StatusStepProps} props - The component props.
 * @returns {React.FC} The StatusStep UI.
 */
const StatusStep: React.FC<StatusStepProps> = memo(({ label, complete, delay }) => {
    /**
     * @state {boolean} isActive - Controls the active state of the step's animation.
     */
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (complete) {
            const timer = setTimeout(() => setIsActive(true), delay);
            return () => clearTimeout(timer);
        }
    }, [complete, delay]);

    return (
        <div className="flex items-center justify-between text-xs">
            <span className={`transition-colors duration-300 ${isActive ? 'text-vitreous-white' : 'text-text-tertiary'}`}>{label}</span>
            <div className="flex items-center space-x-2">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? 'w-16 bg-patina-green shadow-[0_0_8px_rgba(62,185,145,0.6)]' : 'w-4 bg-white/10'}`} />
                <motion.div
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
                    className="text-patina-green"
                >
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4" // Increased size slightly for stroke visibility
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <motion.path
                            d="M4.5 10.5L8 14L15.5 6.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: isActive ? 1 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
                            fillRule="evenodd"
                        />
                    </motion.svg>
                </motion.div>
            </div>
        </div>
    );
});
StatusStep.displayName = 'StatusStep';

/**
 * The InvoiceWidget component.
 * Displays a detailed invoice summary and an animated "PAID" stamp if the invoice status is 'PAID'.
 * It also shows a series of status steps related to invoice processing.
 * @param {InvoiceWidgetProps} props - The component props.
 * @returns {React.FC} The InvoiceWidget UI.
 */
const InvoiceWidget: React.FC<InvoiceWidgetProps> = memo(({ data }) => {
  /**
   * @state {boolean} stamped - Controls the animation state of the "PAID" stamp.
   */
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    if (data.status === 'PAID') {
      const timer = setTimeout(() => setStamped(true), 500);
      return () => clearTimeout(timer);
    }
  }, [data.status]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-panel-bg/60 backdrop-blur-xl shadow-glass group">
      {/* Ambient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-patina-green/5 to-imperial-purple/5 opacity-50" />
      
      {/* Top Decorative Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-patina-green to-transparent opacity-30" />

      <div className="relative p-6">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h4 className="font-comfortaa font-bold text-lg text-vitreous-white tracking-wide">Settlement Protocol</h4>
                <p className="text-xs text-roman-aqua font-mono uppercase tracking-widest mt-1">INV-{data.invoiceNumber}</p>
            </div>
            <div className="text-right">
                <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Client Entity</div>
                <div className="text-sm text-vitreous-white font-lexend">{data.clientName}</div>
            </div>
        </div>

        <div className="flex items-baseline justify-center space-x-1 py-4 border-t border-b border-white/5 my-4 relative">
            <span className="text-2xl text-patina-green/80">$</span>
            <span className="text-5xl font-bold font-comfortaa text-patina-green drop-shadow-[0_0_15px_rgba(62,185,145,0.5)]">
                {data.amount.toLocaleString()}
            </span>
            {/* Subtle Grid Background behind numbers */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] opacity-20 pointer-events-none"></div>
        </div>
      
        {/* PAID Stamp Animation */}
        {data.status === 'PAID' && (
            <div 
                className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-all duration-500`}
                style={{
                    opacity: stamped ? 1 : 0,
                    transform: stamped ? 'scale(1) rotate(-12deg)' : 'scale(1.5) rotate(-30deg)',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
            <div className="border-4 border-patina-green px-8 py-2 rounded-lg bg-panel-bg/90 backdrop-blur-md shadow-[0_0_30px_rgba(62,185,145,0.4)]">
                <span className="text-4xl font-black text-patina-green tracking-[0.2em]">PAID</span>
            </div>
            </div>
        )}

        <div className="space-y-3 mt-4 pt-3 border-t border-white/5">
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-text-secondary uppercase tracking-wider">TAX ALLOCATION (20% TO VAULT)</span>
                    <span className="text-patina-green font-bold">{stamped ? '$3,000.00 ALLOCATED' : 'CALCULATING...'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-roman-aqua to-patina-green rounded-full shadow-[0_0_8px_rgba(62,185,145,0.6)]"
                        initial={{ width: '0%' }}
                        animate={{ width: stamped ? '100%' : '0%' }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-text-secondary uppercase tracking-wider">PROJECT NOTIFICATION ({data.milestoneName || 'PROJECT GENESIS MILESTONE CLEARED'})</span>
                    <span className="text-roman-aqua font-bold">{stamped ? 'AGENT NOTIFIED' : 'PENDING...'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-imperial-purple to-roman-aqua rounded-full shadow-[0_0_8px_rgba(32,178,170,0.6)]"
                        initial={{ width: '0%' }}
                        animate={{ width: stamped ? '100%' : '0%' }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[9px] font-mono text-text-tertiary">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
                    STRIPE RECONCILED · TREASURY VAULT #01
                </span>
                <span className="text-patina-green">AUTONOMOUS SETTLEMENT CONFIRMED</span>
            </div>
        </div>
      </div>
    </div>
  );
});
InvoiceWidget.displayName = 'InvoiceWidget';

export default InvoiceWidget;
