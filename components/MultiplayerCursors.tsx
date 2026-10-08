/**
 * @file components/MultiplayerCursors.tsx
 * @description Renders real-time cursors for other users in a collaborative environment.
 * Each cursor is animated and displays the user's name, enhancing the shared workspace experience.
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';

/**
 * Props for the MultiplayerCursors component.
 * @interface
 */
interface MultiplayerCursorsProps {
  /** A record of all participating users, including their cursor positions. */
  users: Record<string, User>;
  /** The ID of the current user, so their own cursor isn't rendered as an 'other' user. */
  selfId?: string;
  /** Indicates if the current view is on a mobile device (cursors are typically hidden on mobile). */
  isMobile: boolean;
}

/**
 * Props for the Cursor component.
 * @interface
 */
interface CursorProps {
  /** The user data, including cursor position and color. */
  user: User;
}

/**
 * Renders a single animated cursor for a remote user.
 * @param {CursorProps} props - The component props.
 * @returns {React.FC | null} The Cursor UI, or null if the user has no cursor data.
 */
const Cursor: React.FC<CursorProps> = memo(({ user }) => {
    if (!user.cursor) return null;
    return (
        <motion.div
            className="absolute z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
                x: user.cursor.x, 
                y: user.cursor.y,
                opacity: 1,
                scale: 1,
            }}
            transition={{ type: 'spring', stiffness: 800, damping: 40, mass: 0.5 }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'translate(-2px, -2px)' }}>
                <path d="M4.232 4.232l15.536 7.768-5.82 1.94-1.94 5.82L4.232 4.232z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" fill={user.color}/>
            </svg>
            <div 
                className="absolute top-5 left-3 px-2 py-0.5 rounded-full text-xs text-white"
                style={{ backgroundColor: user.color }}
            >
                {user.name}
            </div>
        </motion.div>
    );
});
Cursor.displayName = 'Cursor';

/**
 * The MultiplayerCursors component.
 * Renders a collection of animated cursors for all remote users on the canvas.
 * Cursors are typically hidden on mobile devices.
 * @param {MultiplayerCursorsProps} props - The component props.
 * @returns {React.FC | null} The MultiplayerCursors UI, or null if on mobile.
 */
const MultiplayerCursors: React.FC<MultiplayerCursorsProps> = memo(({ users, selfId, isMobile }) => {
  if (isMobile) {
    return null;
  }
    
  return (
    <>
      <AnimatePresence>
        {(Object.values(users) as User[]).map((user) =>
          user.id !== selfId && user.cursor ? <Cursor key={user.id} user={user} /> : null
        )}
      </AnimatePresence>
    </>
  );
});
MultiplayerCursors.displayName = 'MultiplayerCursors';

export default MultiplayerCursors;