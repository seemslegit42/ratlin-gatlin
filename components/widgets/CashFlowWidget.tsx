/**
 * @file components/widgets/CashFlowWidget.tsx
 * @description Displays an interactive cash flow chart widget.
 * It visualizes cash flow data over time with gradient-filled bars
 * and provides interactive tooltips and click actions for detailed breakdowns.
 */

import React, { memo } from 'react';
import type { CashFlowWidgetData } from '../../types.js';

/**
 * Props for the CashFlowWidget component.
 * @interface
 */
interface CashFlowWidgetProps {
  /** The data to display within the cash flow widget. */
  data: CashFlowWidgetData;
  /** Callback function to handle interaction when a bar is clicked, typically sending a command. */
  onInteraction: (command: string) => void;
}

/**
 * The CashFlowWidget component.
 * Renders a bar chart visualizing cash flow data with a dynamic gradient and interactive elements.
 * Users can click on individual bars to request more details via the `onInteraction` callback.
 * @param {CashFlowWidgetProps} props - The component props.
 * @returns {React.FC} The CashFlowWidget UI.
 */
const CashFlowWidget: React.FC<CashFlowWidgetProps> = memo(({ data, onInteraction }) => {
  const chartHeight = 140;
  const chartWidth = 300;
  const maxValue = Math.max(...data.data.map(d => d.value)) * 1.2; // Add headroom
  
  return (
    <div className="bg-panel-bg/60 backdrop-blur-xl p-5 rounded-2xl border border-glass-border shadow-glass relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-roman-aqua" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
      </div>

      <h4 className="font-comfortaa font-bold text-vitreous-white mb-4 relative z-10">{data.title}</h4>
      
      <div className="mt-2 relative z-10">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
            <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6A0DAD" />
                    <stop offset="100%" stopColor="#20B2AA" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(tick => {
                const y = chartHeight - (tick * (chartHeight - 20)) - 20;
                return (
                    <line key={tick} x1="0" y1={y} x2={chartWidth} y2={y} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                );
            })}

            {data.data.map((d, i) => {
                const barWidth = 40;
                const barHeight = (d.value / maxValue) * (chartHeight - 30);
                const x = (i * (chartWidth / data.data.length)) + 25;
                const y = chartHeight - barHeight - 20;
                
                return (
                    <g 
                        key={d.label} 
                        className="cursor-pointer group transition-all duration-300" 
                        onClick={() => onInteraction(`Give me a detailed breakdown for ${d.label}`)}
                        style={{ transformOrigin: 'bottom' }}
                        aria-label={`Detailed breakdown for ${d.label}`}
                    >
                        {/* Hover Glow Background */}
                        <rect 
                            x={x - 5} y={0} width={barWidth + 10} height={chartHeight} 
                            fill="white" style={{ fillOpacity: 0 }} 
                            className="group-hover:fill-opacity-5 transition-all duration-300"
                            rx="4"
                        />

                        {/* The Bar */}
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill="url(#barGradient)"
                            rx="4"
                            className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            filter="url(#glow)"
                        />
                        
                        {/* Label */}
                        <text
                            x={x + barWidth / 2}
                            y={chartHeight}
                            textAnchor="middle"
                            className="text-[10px] fill-text-secondary font-bold uppercase tracking-wider group-hover:fill-white transition-colors"
                        >
                            {d.label}
                        </text>

                        {/* Value Pop-up */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                             <rect x={x + barWidth/2 - 20} y={y - 25} width="40" height="20" rx="4" fill="#1C1934" stroke="#20B2AA" strokeWidth="1" />
                             <text
                                x={x + barWidth / 2}
                                y={y - 11}
                                textAnchor="middle"
                                className="text-[10px] fill-roman-aqua font-bold font-mono"
                            >
                                ${d.value}M
                            </text>
                        </g>
                    </g>
                );
            })}
        </svg>
      </div>
    </div>
  );
});
CashFlowWidget.displayName = 'CashFlowWidget';

export default CashFlowWidget;