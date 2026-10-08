/**
 * @file components/shared/Sheet.tsx
 * @description A responsive bottom sheet component, primarily for mobile UIs.
 * It slides up from the bottom of the screen and provides a translucent backdrop,
 * useful for displaying controls or content without fully navigating away.
 */

import React, { ReactNode } from 'react';

/**
 * Props for the Sheet component.
 */
interface SheetProps {
    /** Controls the visibility of the sheet. */
    isOpen: boolean;
    /** Callback function to close the sheet. */
    onClose: () => void;
    /** The content to be rendered inside the sheet. */
    children: ReactNode;
}

/**
 * Renders a mobile-first bottom sheet, animating its entry and exit.
 * @param {SheetProps} props - The component props.
 * @returns {React.FC} The Sheet UI.
 */
const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children }) => {
    return (
        <div 
            className={`md:hidden fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`}
            onClick={onClose}
        >
            <div 
                className={`absolute bottom-0 left-0 right-0 bg-panel-bg backdrop-blur-2xl border-t border-glass-border rounded-t-2xl p-3 transition-transform duration-500 ease-in-out high-density ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1 bg-[#8C94A8] rounded-full mx-auto mb-2.5"></div>
                {children}
            </div>
        </div>
    );
};

export default Sheet;
