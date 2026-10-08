
/**
 * @file components/AvatarStack.tsx
 * @description Displays a stack of user avatars, typically used for indicating
 * participants in a multiplayer or collaborative environment.
 * It uses `framer-motion` for smooth entry/exit animations of individual avatars.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types.js';

/**
 * Props for the Avatar component.
 */
interface AvatarProps {
  /** The user data for this avatar. */
  user: User;
  /** Indicates if this avatar represents the current user. */
  isSelf: boolean;
}

/**
 * Renders a single user avatar with initials and a colored background.
 * @param {AvatarProps} props - The component props.
 * @returns {React.FC} The Avatar UI.
 */
const Avatar: React.FC<AvatarProps> = ({ user, isSelf }) => {
  const initials = user.name.substring(0, 2).toUpperCase();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 ${isSelf ? 'border-vitreous-white' : 'border-transparent'}`}
      style={{ backgroundColor: user.color }}
      title={`${user.name} ${isSelf ? '(You)' : ''}`}
    >
      {initials}
    </motion.div>
  );
};

/**
 * Props for the AvatarStack component.
 */
interface AvatarStackProps {
  /** A list of users to display avatars for. */
  users: User[];
  /** The ID of the current user, used to highlight their avatar. */
  selfId?: string;
}

/**
 * Renders a stack of user avatars, with active users animated into view.
 * @param {AvatarStackProps} props - The component props.
 * @returns {React.FC} The AvatarStack UI.
 */
const AvatarStack: React.FC<AvatarStackProps> = ({ users, selfId }) => {
  return (
    <div className="flex -space-x-4 items-center">
      <AnimatePresence>
        {users.map(user => (
          <Avatar key={user.id} user={user} isSelf={user.id === selfId} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AvatarStack;