
/**
 * @file components/hrm/HeadcountWidget.tsx
 * @description A reusable component that displays a summary of the organization's headcount.
 * It shows the total number of personnel and a breakdown by employment type (FTE vs. contract).
 */

import React from 'react';

/**
 * @interface HeadcountWidgetProps
 * @description Props for the HeadcountWidget component.
 */
interface HeadcountWidgetProps {
    /** The total number of personnel. */
    total: number;
    /** The number of full-time employees. */
    fte: number;
    /** The number of contractors. */
    contract: number;
}

/**
 * The HeadcountWidget component.
 * Provides a clear, at-a-glance view of the company's total headcount and its composition.
 * 
 * @param {HeadcountWidgetProps} props - The props for the component.
 * @returns {React.FC} The rendered headcount display UI.
 */
export const HeadcountWidget: React.FC<HeadcountWidgetProps> = ({ total, fte, contract }) => {
    return (
        <div className="flex flex-col justify-center h-full">
            {/* Main metric display */}
            <div className="flex items-baseline space-x-3 mb-2">
                <div className="text-5xl font-bold text-vitreous-white">{total}</div>
                <div className="text-xs text-patina-green font-bold bg-patina-green/10 px-2 py-1 rounded">+3 this month</div>
            </div>
            
            {/* Breakdown by employment type */}
            <div className="flex space-x-6 text-xs text-text-secondary font-mono">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>FTE: {fte}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Contract: {contract}</span>
                </div>
            </div>
        </div>
    );
};