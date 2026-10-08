/**
 * @file components/MobileNav.tsx
 * @description A mobile-specific navigation bar (footer) for switching between different
 * views within the Micro-App Forge. It uses animated underlines to indicate the active tab.
 */


import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the MobileNav component.
 * @interface
 */
interface MobileNavProps {
    /** The currently active tab identifier. */
    activeTab: string;
    /** Callback function to change the active tab. */
    onTabChange: (tab: string) => void;
    /** Indicates if there is content to display in the "Preview" tab. */
    hasPreview: boolean;
}

/** Icons for each tab. */
const ICONS: Record<string, React.ReactNode> = {
    canvas: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M3 12l2-1m0 0l2-1m-2 1v2.5M7 20l2-1m0 0l2-1m-2 1v2.5M17 20l2-1m0 0l2-1m-2 1v2.5M9 12l2 1m0 0l2-1m-2 1v2.5" /></svg>,
    chat: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    preview: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
};

/** Available tab identifiers. */
const TABS = ['canvas', 'chat', 'preview'];

/**
 * The MobileNav component.
 * Renders a sticky footer navigation bar for mobile interfaces, allowing users
 * to switch between different sections (canvas, chat, preview).
 * @param {MobileNavProps} props - The component props.
 * @returns {React.FC} The MobileNav UI.
 */
const MobileNav: React.FC<MobileNavProps> = memo(({ activeTab, onTabChange, hasPreview }) => {
    return (
        <footer className="flex-shrink-0 z-40">
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-16 bg-conchoidal-gray/80 backdrop-blur-xl shadow-glass-edge flex items-center justify-around"
                role="tablist"
            >
                {TABS.map(tab => {
                    const isDisabled = tab === 'preview' && !hasPreview;
                    return (
                        <button 
                            key={tab} 
                            onClick={() => onTabChange(tab)} 
                            disabled={isDisabled}
                            className={`relative flex-1 h-full flex flex-col items-center justify-center transition-colors ${activeTab === tab ? 'text-patina-green' : 'text-vitreous-white/60'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                            role="tab"
                            aria-selected={activeTab === tab}
                            aria-controls={`${tab}-panel`}
                            aria-label={`${tab} view`}
                        >
                            {ICONS[tab]}
                            <span className="text-xs capitalize">{tab}</span>
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="underline" 
                                    className="absolute bottom-0 h-1 w-8 bg-patina-green rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </motion.div>
        </footer>
    );
});
MobileNav.displayName = 'MobileNav';

export default MobileNav;