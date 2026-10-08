
import React from 'react';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  activeClassName?: string;
  baseClassName?: string;
  tooltipContent: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  children,
  isActive = false,
  isDisabled = false,
  activeClassName = '',
  baseClassName = 'bg-conchoidal-gray/50 hover:bg-white/10 text-white',
  tooltipContent,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        p-3 rounded-full transition-colors relative group
        min-h-[44px] min-w-[44px] flex items-center justify-center
        ${baseClassName} ${isActive ? activeClassName : ''}
      `}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={isActive}
      title={tooltipContent}
    >
      {children}
      <span
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-obsidian-black/95 border border-white/10 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none z-tooltip"
        aria-hidden="true"
      >
        {tooltipContent}
      </span>
    </motion.button>
  );
};

export default ActionButton;
