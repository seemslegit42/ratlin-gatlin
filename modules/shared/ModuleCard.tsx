
/**
 * @file modules/shared/ModuleCard.tsx
 * @description A reusable card component for displaying content within the ERP modules (Finance, CRM, etc.).
 * It provides a consistent layout with a title, optional icon, and action button area, adhering to the
 * Verdigris Interface Protocol's glassmorphism aesthetic.
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the ModuleCard component.
 */
interface ModuleCardProps {
    /** The title displayed at the top of the card. */
    title: string;
    /** The main content to be rendered inside the card. */
    children: React.ReactNode;
    /** An optional icon to display next to the title. */
    icon?: React.ReactNode;
    /** Optional additional CSS classes to apply to the card container. */
    className?: string;
    /** An optional React node (e.g., a button) to display in the top-right corner of the card. */
    action?: React.ReactNode;
    /** Optional inline styles to apply to the card container. */
    style?: React.CSSProperties;
}

/**
 * A standardized, animated card component for ERP modules.
 * 
 * @param {ModuleCardProps} props - The props for the component.
 * @returns {React.FC} A styled card container with an entrance animation.
 */
export const ModuleCard: React.FC<ModuleCardProps> = ({ title, children, icon, className = '', action, style }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-panel-bg/40 backdrop-blur-xl border border-glass-border rounded-xl p-3 md:p-4 shadow-glass flex flex-col font-lexend high-density-card ${className}`}
            style={style}
        >
            {/* Card Header */}
            <div className="flex justify-between items-center mb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {icon && <div className="text-text-secondary flex-shrink-0">{icon}</div>}
                    <h3 className="app-heading font-comfortaa font-bold text-base md:text-lg text-vitreous-white truncate">{title}</h3>
                </div>
                {action}
            </div>
            
            {/* Card Body */}
            <div className="flex-grow">
                {children}
            </div>
        </motion.div>
    );
};