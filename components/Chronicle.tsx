/**
 * @file components/Chronicle.tsx
 * @description Displays a chronological log of system, user, and agent events.
 * It's draggable, collapsible, and supports filtering by event type.
 */

import React, { useState, memo } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import type { ChronicleEvent } from '../types.js';
import { ChronicleEventType } from '../types.js';

/**
 * Props for the Chronicle component.
 * @interface
 */
interface ChronicleProps {
  /** An array of chronicle events to display. */
  events: ChronicleEvent[];
  /** Indicates if the component is rendered for a mobile device. */
  isMobile: boolean;
  /** Ref to the DOM element that constrains the dragging boundaries. */
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

/** Icons mapping to each ChronicleEventType. */
// Fix: Corrected ChronicleEventType member casing to uppercase
const ICONS: Record<ChronicleEventType, React.ReactNode> = {
  [ChronicleEventType.SYSTEM]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1a1 1 0 01-1-1V4a3 3 0 10-6 0v1.5a1.5 1.5 0 01-3 0V4a1 1 0 00-1-1H3a1 1 0 01-1-1v-3a1 1 0 011-1h1v-1a1 1 0 10-2 0v1H1a1 1 0 100 2h1a1 1 0 011 1v3a3 3 0 006 0V6.5a1.5 1.5 0 013 0V8a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1a1 1 0 01-1-1V8a3 3 0 00-6 0v1.5a1.5 1.5 0 01-3 0V8a1 1 0 00-1-1H3a1 1 0 01-1-1V4a1 1 0 011-1h1v-1a1 1 0 10-2 0v1H1a1 1 0 100 2h1a1 1 0 011 1v3a3 3 0 006 0V3.5z" /></svg>
  ),
  [ChronicleEventType.USER]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
  ),
  [ChronicleEventType.AGENT]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
  ),
};

/** Color styles for each ChronicleEventType. */
// Fix: Corrected ChronicleEventType member casing to uppercase
const COLORS: Record<ChronicleEventType, { text: string; bg: string }> = {
  [ChronicleEventType.SYSTEM]: { text: 'text-imperial-purple', bg: 'bg-imperial-purple/20' },
  [ChronicleEventType.USER]: { text: 'text-roman-aqua', bg: 'bg-roman-aqua/20' },
  [ChronicleEventType.AGENT]: { text: 'text-patina-green', bg: 'bg-patina-green/20' },
};

/**
 * The Chronicle component.
 * Displays a chronological list of system events, user actions, and agent activities.
 * It is draggable on desktop, collapsible on mobile, and allows filtering events.
 * @param {ChronicleProps} props - The component props.
 * @returns {React.FC} The Chronicle UI.
 */
const Chronicle: React.FC<ChronicleProps> = memo(({ events, isMobile, dragConstraintsRef }) => {
  const dragControls = useDragControls();
  const [isCollapsed, setIsCollapsed] = useState(isMobile ? true : false); // Collapse by default on mobile
  // Fix: Corrected ChronicleEventType member casing to uppercase
  const [filters, setFilters] = useState<Record<ChronicleEventType, boolean>>({
    [ChronicleEventType.SYSTEM]: true,
    [ChronicleEventType.USER]: true,
    [ChronicleEventType.AGENT]: true,
  });

  /**
   * Toggles the filter for a specific event type.
   * @param {ChronicleEventType} type - The event type to toggle.
   */
  const toggleFilter = (type: ChronicleEventType) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredEvents = events.filter(event => filters[event.type]);

  return (
    <motion.div
      drag={!isMobile}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={dragConstraintsRef} // Apply drag constraints here
      initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: 16, y: 80 }}
      animate={isMobile ? { y: isCollapsed ? 'calc(100% - 73px)' : '50%' } : { opacity: 1, scale: 1, x: 16, y: 80 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex flex-col z-20 bg-panel-bg backdrop-blur-xl
                       fixed bottom-0 left-0 right-0 w-full rounded-t-2xl shadow-glass shadow-glass-edge border-t border-glass-border
                       md:absolute md:w-96 md:max-h-[60vh] md:rounded-2xl md:left-4 md:top-20 md:bottom-auto md:right-auto"
    >
      <header onPointerDown={(e) => !isMobile && dragControls.start(e)} className={`p-4 border-b border-glass-border flex justify-between items-center ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <div>
          <h2 className="font-comfortaa text-xl text-vitreous-white">The Chronicle</h2>
          <p className="text-sm text-vitreous-white/50">Live Event Log</p>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-full text-vitreous-white/50 hover:bg-white/10" title={isCollapsed ? "Expand" : "Collapse"} aria-label={isCollapsed ? "Expand Chronicle panel" : "Collapse Chronicle panel"}>
          {isCollapsed ?
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg> :
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          }
        </button>
      </header>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-grow overflow-hidden"
          >
            <div className="p-2 border-b border-glass-border flex items-center justify-between">
              <p className="text-xs text-vitreous-white/60 px-2">Filters:</p>
              <div className="flex space-x-1">
                {(Object.values(ChronicleEventType) as ChronicleEventType[]).map(type => (
                  <button 
                    key={type} 
                    onClick={() => toggleFilter(type)} 
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${filters[type] ? `${COLORS[type].bg} border-current ${COLORS[type].text}` : 'border-transparent text-vitreous-white/50 hover:bg-white/10'}`}
                    aria-label={`Toggle ${type} filter`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow p-2 overflow-y-auto">
              <ul className="space-y-2">
                {filteredEvents.map(event => (
                  <li key={event.id} className="flex items-start space-x-3 text-sm">
                    <div className={`flex-shrink-0 mt-1 p-1.5 rounded-full bg-black/20 ${COLORS[event.type].text}`}>
                      {ICONS[event.type]}
                    </div>
                    <div className="flex-grow">
                      <p className="text-vitreous-white/90 leading-tight">{event.message}</p>
                      <p className="text-xs text-vitreous-white/40">
                        {new Date(event.timestamp).toLocaleTimeString()}
                        {event.source && ` | ${event.source}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
Chronicle.displayName = 'Chronicle';

export default Chronicle;