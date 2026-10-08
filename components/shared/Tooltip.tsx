
import React, { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

type TooltipTriggerProps = {
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
};

/**
 * Tooltip component — shown on hover AND focus.
 * Associates tooltip with the trigger via aria-describedby for screen readers.
 */
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const tooltipId = useId();

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  const trigger = React.Children.only(children) as React.ReactElement<TooltipTriggerProps>;
  const childWithA11y = React.cloneElement(trigger, {
    'aria-describedby': isVisible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show();
      trigger.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide();
      trigger.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show();
      trigger.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide();
      trigger.props.onBlur?.(e);
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <div className="relative inline-block">
      {childWithA11y}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-obsidian-black/95 border border-white/10 text-vitreous-white rounded-md shadow-lg whitespace-nowrap pointer-events-none z-[600]"
          >
            {content}
            <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-obsidian-black transform -translate-x-1/2 rotate-45" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;