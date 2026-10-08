/**
 * @file components/LivePreview.tsx
 * @description A draggable and resizable modal component that displays a URL
 * within an iframe, typically used for live-previewing micro-applications. It supports
 * toggling between windowed and fullscreen modes.
 */

import React, { memo } from 'react';
import { motion, useDragControls } from 'framer-motion';

/**
 * Props for the LivePreview component.
 * @interface
 */
interface LivePreviewProps {
    /** The URL to display inside the iframe. */
    url: string;
    /** Controls whether the preview is in fullscreen mode. */
    isFullScreen: boolean;
    /** Callback function to close the preview. */
    onClose: () => void;
    /** Callback function to toggle fullscreen mode. */
    onToggleFullScreen: () => void;
    /** Reference to the DOM element that constrains dragging. */
    dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

/**
 * A draggable and resizable modal component that displays a URL within an iframe.
 * @param {LivePreviewProps} props - The component props.
 * @returns {React.FC} The LivePreview UI.
 */
const LivePreview: React.FC<LivePreviewProps> = memo(({
  url,
  isFullScreen,
  onClose,
  onToggleFullScreen,
  dragConstraintsRef,
}) => {
  const dragControls = useDragControls();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close preview"
      />

      <motion.div
        drag={!isFullScreen} // Disable drag in fullscreen
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragConstraints={dragConstraintsRef}
        initial={{ opacity: 0, scale: 0.8, x: '50%', y: '50%' }}
        animate={{ 
            opacity: 1, 
            scale: 1, 
            x: isFullScreen ? '0%' : '-50%', 
            y: isFullScreen ? '0%' : '-50%',
            width: isFullScreen ? '100vw' : '70vw',
            height: isFullScreen ? '100vh' : '80vh',
            top: isFullScreen ? '0' : '50%',
            left: isFullScreen ? '0' : '50%',
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed z-[70] bg-panel-bg/95 backdrop-blur-2xl border border-glass-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-white
                    ${isFullScreen ? 'inset-0 !top-0 !left-0 !w-screen !h-screen rounded-none' : 'max-w-4xl max-h-[90vh]'}
                `}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-preview-title"
      >
        {/* Header */}
        <div
          onPointerDown={(e) => !isFullScreen && dragControls.start(e)}
          className={`flex items-center justify-between p-3 bg-white/5 border-b border-white/10 ${!isFullScreen ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <h3 id="live-preview-title" className="text-sm font-bold font-comfortaa text-vitreous-white truncate max-w-[calc(100%-80px)]" title={url}>
            Live Preview: {url}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-full text-vitreous-white/50 hover:bg-white/10 transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullScreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3m-18 0h3a2 2 0 0 1 2 2v3" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3" /></svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-vitreous-white/50 hover:bg-white/10 transition-colors"
              title="Close Preview"
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        {/* Iframe Content */}
        <div className="flex-grow bg-black">
          <iframe
            src={url}
            title="Live Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-popups allow-pointer-lock allow-same-origin allow-geolocation"
          />
        </div>
      </motion.div>
    </>
  );
});
LivePreview.displayName = 'LivePreview';

export default LivePreview;