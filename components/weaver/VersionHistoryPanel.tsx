
import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import type { WorkflowVersion } from '../../types';
import { HistoryIcon } from '../icons/HistoryIcon';
import { TrashIcon, PlayIcon } from '../icons/CommandPaletteIcons'; // Reusing existing icons

interface VersionHistoryPanelProps {
    versions: WorkflowVersion[];
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    onOpenSaveModal: () => void;
    dragConstraintsRef: React.RefObject<HTMLDivElement>;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ 
    versions, onRestore, onDelete, onClose, onOpenSaveModal, dragConstraintsRef 
}) => {
    const dragControls = useDragControls();

    return (
        <motion.div
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            dragConstraints={dragConstraintsRef}
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-20 left-24 w-80 max-h-[70vh] z-30 flex flex-col
                    bg-panel-bg backdrop-blur-xl rounded-2xl shadow-glass shadow-glass-edge border border-glass-border"
        >
            <header onPointerDown={(e) => dragControls.start(e)} className="p-4 border-b border-glass-border flex justify-between items-center cursor-grab active:cursor-grabbing">
                <div className="flex items-center space-x-2">
                    <HistoryIcon className="w-5 h-5 text-roman-aqua" />
                    <div>
                        <h2 className="font-comfortaa text-lg text-vitreous-white">Temporal Archives</h2>
                        <p className="text-[10px] text-vitreous-white/50 uppercase tracking-widest">Version Control</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full text-vitreous-white/50 hover:bg-white/10" title="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            </header>

            <div className="p-4 border-b border-white/5">
                <button 
                    onClick={onOpenSaveModal}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-vitreous-white uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
                >
                    <span>+ Snapshot Current State</span>
                </button>
            </div>

            <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
                {versions.length === 0 ? (
                    <div className="text-center py-12 text-vitreous-white/40">
                        <p className="text-sm">No archives found.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {versions.map(version => (
                            <li key={version.id} className="p-3 bg-black/20 rounded-lg border border-transparent hover:border-white/10 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-sm text-vitreous-white">{version.name}</h4>
                                        <p className="text-[10px] text-text-tertiary font-mono">{new Date(version.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`Restore version '${version.name}'? Current unsaved changes will be snapshotted.`)) {
                                                    onRestore(version.id);
                                                }
                                            }}
                                            className="p-1.5 rounded bg-roman-aqua/20 text-roman-aqua hover:bg-roman-aqua hover:text-black transition-colors"
                                            title="Restore Version"
                                        >
                                            <PlayIcon className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`Permanently delete archive '${version.name}'?`)) {
                                                    onDelete(version.id);
                                                }
                                            }}
                                            className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                            title="Delete Archive"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] text-text-secondary">
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">{Object.keys(version.snapshot.agents).length} Agents</span>
                                    {version.description && (
                                        <p className="line-clamp-1 italic opacity-70 border-l border-white/10 pl-2">{version.description}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
    );
};

export default VersionHistoryPanel;
