/**
 * @file components/Notifications.tsx
 * @description Displays transient, animated notifications to the user.
 * It supports different notification types (success, error, info) with corresponding icons and styling.
 * Uses `framer-motion` for smooth entry and exit animations.
 */

import React, { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Interface for a single notification object.
 * @interface
 */
export interface Notification {
  /** A unique identifier for the notification. */
  id: number;
  /** The message content of the notification. */
  message: string;
  /** The type of the notification, influencing its styling and icon. */
  type: 'success' | 'error' | 'info';
}

/** Icons for different notification types. */
const ICONS: Record<Notification['type'], React.ReactNode> = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

/** Background colors for different notification types. */
const BG_COLORS: Record<Notification['type'], string> = {
    success: 'bg-patina-green/90',
    error: 'bg-red-500/90',
    info: 'bg-imperial-purple/90'
};

/**
 * Props for the Notifications component.
 * @interface
 */
interface NotificationsProps {
    /** An array of notification objects to display. */
    notifications: Notification[];
}

/**
 * The Notifications component.
 * Renders a stack of transient notifications that appear from the top-right of the screen.
 * Notifications are animated in and out, and styled according to their type.
 * @param {NotificationsProps} props - The component props.
 * @returns {React.FC} The Notifications UI.
 */
const Notifications: React.FC<NotificationsProps> = memo(({ notifications }) => {
  return (
    <div className="fixed top-20 right-0 md:right-4 z-[100] w-full md:w-auto flex flex-col items-center md:items-end space-y-2 px-4 high-density" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center w-full max-w-sm p-4 text-white ${BG_COLORS[n.type]} rounded-lg shadow-lg shadow-glass-edge backdrop-blur-md`}
            role="status"
            aria-label={`${n.type} notification: ${n.message}`}
          >
            <div className="flex-shrink-0">{ICONS[n.type]}</div>
            <div className="ml-3 text-sm font-medium">{n.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
Notifications.displayName = 'Notifications';

export default Notifications;