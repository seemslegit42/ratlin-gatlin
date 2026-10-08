
import React from 'react';
import { motion } from 'framer-motion';
import type { Note } from '../../../types';
import { TrashIcon } from '../../../components/icons/CommandPaletteIcons';
import { PinIcon } from '../../../components/icons/PinIcon';

interface NoteCardProps {
    note: Note;
    onClick: (note: Note) => void;
    onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Strategy': 'border-imperial-purple/50 bg-imperial-purple/10 text-imperial-purple',
    'Prompts': 'border-roman-aqua/50 bg-roman-aqua/10 text-roman-aqua',
    'Ideas': 'border-patina-green/50 bg-patina-green/10 text-patina-green',
    'Logs': 'border-white/20 bg-white/5 text-text-tertiary',
    'Drafts': 'border-text-secondary/30 bg-text-secondary/10 text-text-secondary'
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete }) => {
    const colorClass = CATEGORY_COLORS[note.category] || CATEGORY_COLORS['Drafts'];
    const isArchived = note.status === 'Archived';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isArchived ? 0.6 : 1, scale: 1 }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: 1 }}
            onClick={() => onClick(note)}
            className={`relative group bg-panel-bg/60 backdrop-blur-md border border-glass-border rounded-xl p-5 cursor-pointer overflow-hidden flex flex-col h-full min-h-[180px] transition-all ${isArchived ? 'grayscale-[0.5]' : ''}`}
        >
            <div className={`absolute top-0 left-0 w-full h-1 ${colorClass.split(' ')[0].replace('border', 'bg')}`} />
            
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${colorClass}`}>
                    {note.category}
                </span>
                <div className="flex space-x-2">
                    {note.status === 'Pinned' && (
                        <PinIcon className="w-4 h-4 text-roman-aqua transform rotate-45" />
                    )}
                    {isArchived && (
                        <span className="text-[9px] uppercase font-bold text-text-tertiary border border-white/10 px-1.5 py-0.5 rounded">Archived</span>
                    )}
                </div>
            </div>

            <h3 className={`text-lg font-bold font-comfortaa mb-2 line-clamp-2 ${isArchived ? 'text-text-secondary' : 'text-white'}`}>
                {note.title}
            </h3>
            
            <div className="flex-grow text-xs text-text-tertiary font-lexend leading-relaxed line-clamp-4 mb-4">
                {note.content || <span className="italic opacity-50">Empty shard...</span>}
            </div>

            <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] text-text-secondary bg-white/5 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                    {note.tags.length > 3 && <span className="text-[9px] text-text-tertiary">+{note.tags.length - 3}</span>}
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-red-400 transition-all"
                    title="Delete Permanently"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
            
            <div className="absolute bottom-2 right-2 text-[9px] text-text-tertiary font-mono opacity-50">
                {new Date(note.updatedAt).toLocaleDateString()}
            </div>
        </motion.div>
    );
};
