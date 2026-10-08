
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlayIcon } from '../icons/CommandPaletteIcons';
import { SaveIcon } from '../icons/SaveIcon';
import { ChainIcon } from '../icons/ChainIcon';
import { LayersIcon } from '../icons/LayersIcon';

interface AgentContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: 'delete' | 'duplicate' | 'saveTemplate' | 'run' | 'connect') => void;
}

export const AgentContextMenu: React.FC<AgentContextMenuProps> = ({ x, y, onClose, onAction }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAction = (action: 'delete' | 'duplicate' | 'saveTemplate' | 'run' | 'connect') => {
        onAction(action);
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1 }}
                className="fixed z-[100] bg-panel-bg/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 w-48 overflow-hidden"
                style={{ top: y, left: x }}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Agent Actions</span>
                </div>
                
                <button onClick={() => handleAction('run')} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors text-left group">
                    <PlayIcon className="w-4 h-4 text-patina-green group-hover:text-white transition-colors" />
                    <span>Run Agent</span>
                </button>

                <button onClick={() => handleAction('connect')} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors text-left group">
                    <ChainIcon className="w-4 h-4 text-roman-aqua group-hover:text-white transition-colors" />
                    <span>Start Connection</span>
                </button>

                <div className="h-px bg-white/10 my-1 mx-2" />

                <button onClick={() => handleAction('duplicate')} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors text-left group">
                    <LayersIcon className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
                    <span>Duplicate</span>
                </button>

                <button onClick={() => handleAction('saveTemplate')} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors text-left group">
                    <SaveIcon className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
                    <span>Save as Template</span>
                </button>

                <div className="h-px bg-white/10 my-1 mx-2" />

                <button onClick={() => handleAction('delete')} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left">
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete Agent</span>
                </button>
            </motion.div>
        </AnimatePresence>
    );
};
