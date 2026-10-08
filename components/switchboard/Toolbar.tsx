/**
 * @file components/switchboard/Toolbar.tsx
 * @description Provides a draggable toolbar for adding new modules to the Micro-App Forge canvas.
 * It categorizes available modules and allows users to drag and drop them to create new instances.
 */

import React, { useState, memo } from 'react';
import { availableModuleCategories } from '../../services/microAppForgeService.js';
import type { AvailableModule } from '../../types.js';
import { ChevronDownIcon } from '../icons/ChevronDownIcon.js';

/**
 * Props for a single ToolbarItem.
 * @interface
 */
interface ToolbarItemProps {
    /** The data for the available module type. */
    module: AvailableModule;
    /** Callback function triggered when module is selected (drag for desktop, click for mobile). */
    onSelectModule: (module: AvailableModule) => void;
    /** Determines if the component should render for mobile interaction. */
    isMobile?: boolean;
}

/**
 * Renders a draggable item in the toolbar representing an available module type.
 * @param {ToolbarItemProps} props - The component props.
 * @returns {React.FC} The ToolbarItem UI.
 */
const ToolbarItem: React.FC<ToolbarItemProps> = memo(({ module, onSelectModule, isMobile }) => {
    /**
     * Handles the drag start event, setting the data for the dragged module.
     * @param {React.DragEvent} e - The drag event.
     */
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(module));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div 
            className="group relative p-3 bg-white/5 border border-white/5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            draggable={!isMobile}
            onDragStart={handleDragStart}
            onClick={() => { if(isMobile) onSelectModule(module); }}
            aria-label={`Add ${module.name} module`}
        >
            <div className="absolute inset-0 bg-imperial-purple/0 group-hover:bg-imperial-purple/5 transition-colors rounded-lg" />
            <h4 className="font-bold text-center text-xs font-comfortaa text-vitreous-white group-hover:text-white relative z-10">{module.name}</h4>
        </div>
    );
});
ToolbarItem.displayName = 'ToolbarItem';

/**
 * Props for the ToolbarContent component.
 * @interface
 */
interface ToolbarContentProps {
  /** Optional callback triggered when a module is selected. */
  onSelectModule?: (module: AvailableModule) => void;
  /** Flag to indicate if rendering for mobile. */
  isMobile?: boolean;
}

/**
 * Renders the categorized content of the toolbar, displaying available modules.
 * @param {ToolbarContentProps} props - The component props.
 * @returns {React.FC} The ToolbarContent UI.
 */
const ToolbarContent: React.FC<ToolbarContentProps> = memo(({ onSelectModule = () => {}, isMobile }) => {
    const [openCategory, setOpenCategory] = useState<string | null>(availableModuleCategories[1]?.name || null);

    return (
        <div className="space-y-4">
            {availableModuleCategories.map(category => (
                <div key={category.name}>
                    <button 
                        className="w-full text-left font-bold text-xs uppercase tracking-widest text-text-tertiary mb-2 flex justify-between items-center hover:text-white transition-colors"
                        onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
                        aria-expanded={openCategory === category.name}
                        aria-controls={`category-modules-${category.name}`}
                    >
                        <span>{category.name}</span>
                        <ChevronDownIcon className={`w-3 h-3 transition-transform ${openCategory === category.name ? 'rotate-180' : ''}`} />
                    </button>
                    {openCategory === category.name && (
                        <div id={`category-modules-${category.name}`} className="space-y-2 pl-2 border-l border-white/10">
                            {category.modules.map(mod => (
                                <ToolbarItem key={mod.name} module={mod} onSelectModule={onSelectModule} isMobile={isMobile} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});
ToolbarContent.displayName = 'ToolbarContent';

/**
 * The main Toolbar component for desktop, positioned on the left side of the canvas.
 * @param {ToolbarContentProps} props - The component props.
 * @returns {React.FC} The desktop Toolbar UI.
 */
const Toolbar: React.FC<ToolbarContentProps> = memo(({ onSelectModule = () => {} }) => {
  return (
    // Desktop Toolbar - Glassmorphic
    <div className="hidden md:block fixed top-24 left-4 bg-panel-bg/80 backdrop-blur-xl border border-glass-border rounded-2xl p-5 shadow-glass z-30 w-64 high-density">
        <h3 className="text-sm font-bold text-vitreous-white text-center mb-6 font-comfortaa border-b border-white/10 pb-4">
            Forging Tools
        </h3>
        <ToolbarContent onSelectModule={onSelectModule} />
    </div>
  );
});
Toolbar.displayName = 'Toolbar';

/**
 * Props for the MobileToolbarSheet component.
 * @interface
 */
interface MobileToolbarSheetProps {
    /** Callback to add a module when an item is tapped. */
    onAddModule: (module: AvailableModule) => void;
}

/**
 * Mobile-specific sheet content for the toolbar, allowing module selection.
 * @param {MobileToolbarSheetProps} props - The component props.
 * @returns {React.FC} The mobile Toolbar Sheet UI.
 */
export const MobileToolbarSheet: React.FC<MobileToolbarSheetProps> = memo(({ onAddModule }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-vitreous-white text-center mb-4 font-comfortaa">Add Instrument</h3>
            <div className="max-h-[50vh] overflow-y-auto pr-2">
                <ToolbarContent onSelectModule={onAddModule} isMobile={true} />
            </div>
        </div>
    );
});
MobileToolbarSheet.displayName = 'MobileToolbarSheet';

export default Toolbar;