/**
 * @file components/CommandPalette.tsx
 * @description A global command palette component that allows users to quickly search for
 * and execute various commands or actions within the application. It supports fuzzy searching,
 * keyboard navigation, and a command history.
 */


import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Interface for a single command item in the palette.
 * @interface
 */
export interface Command {
  /** A unique identifier for the command. */
  id: string;
  /** The display name of the command. */
  name: string;
  /** An optional description of the command's function. */
  description?: string;
  /** An optional ReactNode to display as an icon for the command. */
  icon?: React.ReactNode;
  /** The action to perform when the command is executed. */
  action: () => void;
  /** The category to which the command belongs. */
  category: string;
}

/**
 * Props for the CommandPalette component.
 * @interface
 */
interface CommandPaletteProps {
  /** Controls the visibility of the command palette. */
  isOpen: boolean;
  /** Callback function to close the command palette. */
  onClose: () => void;
  /** An array of all available commands to display. */
  commands: Command[];
}

/**
 * The global CommandPalette component.
 * Provides a searchable overlay for executing commands, with keyboard navigation and history recall.
 * @param {CommandPaletteProps} props - The component props.
 * @returns {React.FC} The CommandPalette UI.
 */
const CommandPalette: React.FC<CommandPaletteProps> = memo(({ isOpen, onClose, commands }) => {
  /** @state {string} searchTerm - The current value of the search input. */
  const [searchTerm, setSearchTerm] = useState('');
  /** @state {number} activeIndex - The index of the currently highlighted command in the filtered list. */
  const [activeIndex, setActiveIndex] = useState(0);

  // --- Command History State ---
  /** @state {string[]} history - A list of recently executed search terms. */
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []; // SSR safety
    try {
      const item = window.localStorage.getItem('command_palette_history');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn('Could not read command history from localStorage', error);
      return [];
    }
  });
  /** @state {number | null} historyIndex - The index of the currently recalled command from history, or null if not in history mode. */
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  // Persist history to localStorage whenever it changes.
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR safety
    try {
      window.localStorage.setItem('command_palette_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Could not save command history to localStorage', error);
    }
  }, [history]);

  /**
   * Filters the list of commands based on the current `searchTerm`.
   * @type {Command[]}
   */
  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cmd.category && cmd.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset state when the palette is closed.
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
      setHistoryIndex(null);
    }
  }, [isOpen]);

  /**
   * Executes the selected command and updates the command history.
   * @param {Command} command - The command to execute.
   */
  const handleExecuteCommand = useCallback((command: Command) => {
    command.action();
    const executedSearchTerm = searchTerm.trim();
    // Add to history if it's a new, non-empty command
    if (executedSearchTerm && history[0] !== executedSearchTerm) {
      setHistory(prev => [executedSearchTerm, ...prev.slice(0, 49)]); // Prepend and limit to 50
    }
    onClose();
  }, [onClose, searchTerm, history]);

  /**
   * Handles keyboard events for navigation and command execution.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (historyIndex !== null) { // In history mode
          const newIndex = historyIndex - 1;
          if (newIndex >= 0) {
            setHistoryIndex(newIndex);
            setSearchTerm(history[newIndex]);
          } else { // Exit history mode (at the "present")
            setHistoryIndex(null);
            setSearchTerm('');
          }
        } else if (filteredCommands.length > 0) { // List navigation
          setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (historyIndex !== null) { // Already in history mode
          const newIndex = Math.min(history.length - 1, historyIndex + 1);
          setHistoryIndex(newIndex);
          setSearchTerm(history[newIndex]);
        } else { // In list navigation mode
          if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
          } else if (history.length > 0) { // At top of list, switch to history
            setHistoryIndex(0);
            setSearchTerm(history[0]);
          }
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          handleExecuteCommand(filteredCommands[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        onClose();
        break;
      }
    }
  }, [isOpen, activeIndex, filteredCommands, onClose, history, historyIndex, searchTerm, handleExecuteCommand]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Handles changes to the search input field, updating `searchTerm` and resetting navigation states.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Exit history mode when user types
    setHistoryIndex(null);
    setActiveIndex(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-panel-bg rounded-2xl shadow-glass border border-glass-border overflow-hidden high-density"
          >
            <div className="p-2 border-b border-glass-border">
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search commands or use ↑↓ to recall history..."
                className="w-full p-3 bg-transparent text-lg text-text-primary placeholder-text-secondary focus:outline-none"
                aria-label="Search commands"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredCommands.length > 0 ? (
                <ul role="listbox">
                  {filteredCommands.map((cmd, index) => (
                    <li key={cmd.id} role="option" aria-selected={activeIndex === index}>
                      <button
                        onClick={() => handleExecuteCommand(cmd)}
                        className={`w-full text-left p-4 flex items-center space-x-4 transition-colors ${activeIndex === index ? 'bg-imperial-purple/40' : 'hover:bg-white/10'}`}
                        aria-label={`${cmd.name}: ${cmd.description || 'Execute command'}`}
                      >
                        <div className="text-text-secondary">{cmd.icon}</div>
                        <div>
                          <p className="text-base text-text-primary">{cmd.name}</p>
                          {cmd.description && <p className="text-sm text-text-secondary">{cmd.description}</p>}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center p-8 text-text-secondary">No commands found.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
CommandPalette.displayName = 'CommandPalette';

export default CommandPalette;