/**
 * @file components/ControlPanel.tsx
 * @description Provides a set of canvas interaction controls, including zoom in, zoom out, and reset view.
 * This panel is typically positioned at the top-right of the canvas, offering intuitive navigation.
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from './icons/PlusIcon.js';
import { MinusIcon, ResetZoomIcon } from './icons/ZoomIcons.js';

/**
 * Props for the ControlPanel component.
 * @interface
 */
interface ControlPanelProps {
  /** The current zoom level of the canvas. */
  zoom: number;
  /** Callback function to increase the zoom level. */
  onZoomIn: () => void;
  /** Callback function to decrease the zoom level. */
  onZoomOut: () => void;
  /** Callback function to reset the canvas view to its default pan and zoom. */
  onResetView: () => void;
}

/**
 * The ControlPanel component.
 * Provides buttons for zooming in, zooming out, and resetting the view of a canvas.
 * @param {ControlPanelProps} props - The component props.
 * @returns {React.FC} The ControlPanel UI.
 */
const ControlPanel: React.FC<ControlPanelProps> = memo(({ zoom, onZoomIn, onZoomOut, onResetView }) => {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
      className="absolute top-4 right-4 z-20 flex flex-col items-center space-y-1.5 p-1.5
                 bg-conchoidal-gray/80 backdrop-blur-xl rounded-2xl shadow-glass shadow-glass-edge high-density"
    >
      <button onClick={onZoomIn} className="p-3 rounded-lg text-vitreous-white/70 hover:bg-white/10 hover:text-white" title="Zoom In" aria-label="Zoom in">
        <PlusIcon className="w-5 h-5" />
      </button>
      <div className="w-10 text-center font-mono text-xs text-vitreous-white/80 select-none" aria-live="polite">
        {Math.round(zoom * 100)}%
      </div>
      <button onClick={onZoomOut} className="p-3 rounded-lg text-vitreous-white/70 hover:bg-white/10 hover:text-white" title="Zoom Out" aria-label="Zoom out">
        <MinusIcon className="w-5 h-5" />
      </button>
      <div className="h-px w-8 bg-white/10 my-1"></div>
      <button onClick={onResetView} className="p-3 rounded-lg text-vitreous-white/70 hover:bg-white/10 hover:text-white" title="Reset View" aria-label="Reset view">
        <ResetZoomIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
});
ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;