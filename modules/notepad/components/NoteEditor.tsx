
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Note } from '../../../types';
import MarkdownRenderer from '../../../components/shared/MarkdownRenderer';
import { LayersIcon } from '../../../components/icons/LayersIcon';
import { ZapIcon } from '../../../components/icons/VitalsIcons';
import { PinIcon } from '../../../components/icons/PinIcon';
import { PinOffIcon } from '../../../components/icons/PinOffIcon';
import { runTextRefinement } from '../../../services/ollamaService';

interface NoteEditorProps {
    note: Partial<Note>;
    onSave: (note: Partial<Note>) => void;
    onClose: () => void;
}

const CATEGORIES = ['Strategy', 'Prompts', 'Ideas', 'Logs', 'Drafts'];

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
    const [title, setTitle] = useState(note.title || '');
    const [content, setContent] = useState(note.content || '');
    const [category, setCategory] = useState(note.category || 'Drafts');
    const [tags, setTags] = useState(note.tags?.join(', ') || '');
    const [status, setStatus] = useState<'Active' | 'Pinned' | 'Archived'>(note.status as any || 'Active');
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [isRefining, setIsRefining] = useState(false);

    const handleSave = () => {
        onSave({
            ...note,
            title,
            content,
            category: category as any,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            status: status
        });
        onClose();
    };

    const handleRefine = async (mode: 'summarize' | 'expand' | 'polish' | 'action_items') => {
        if (!content.trim()) return;
        setIsRefining(true);
        try {
            const refined = await runTextRefinement(content, mode);
            if (mode === 'action_items') {
                setContent(prev => prev + "\n\n### Action Items\n" + refined);
            } else {
                setContent(refined);
            }
        } catch (e) {
            console.error("Refinement failed", e);
        } finally {
            setIsRefining(false);
        }
    };

    const togglePin = () => {
        setStatus(prev => prev === 'Pinned' ? 'Active' : 'Pinned');
    };
    
    const toggleArchive = () => {
        setStatus(prev => prev === 'Archived' ? 'Active' : 'Archived');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-obsidian-black border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="Shard Title..."
                        className="bg-transparent text-xl font-bold font-comfortaa text-white placeholder-white/30 focus:outline-none w-full"
                    />
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={togglePin}
                            className={`p-2 rounded transition-colors ${status === 'Pinned' ? 'text-roman-aqua bg-roman-aqua/10' : 'text-text-secondary hover:text-white hover:bg-white/10'}`}
                            title={status === 'Pinned' ? "Unpin" : "Pin to Top"}
                        >
                            {status === 'Pinned' ? <PinIcon className="w-5 h-5" /> : <PinOffIcon className="w-5 h-5" />}
                        </button>
                        
                        <div className="h-6 w-px bg-white/10 mx-1" />

                        <button 
                            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                            className={`p-2 rounded hover:bg-white/10 text-text-secondary hover:text-white transition-colors ${viewMode === 'preview' ? 'text-patina-green' : ''}`}
                            title="Toggle Preview"
                        >
                            <LayersIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-6 py-2 bg-patina-green hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition-colors shadow-lg shadow-patina-green/20"
                        >
                            Save Shard
                        </button>
                    </div>
                </div>

                {/* AI Toolbar */}
                <div className="flex flex-wrap gap-2 p-2 px-4 bg-black/40 border-b border-white/5 items-center">
                    <ZapIcon className={`w-4 h-4 text-imperial-purple ${isRefining ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold text-imperial-purple uppercase tracking-wider mr-2">
                        {isRefining ? 'Neural Processing...' : 'Neural Tools'}
                    </span>
                    
                    <button onClick={() => handleRefine('polish')} disabled={isRefining} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[10px] text-white transition-colors">
                        Polish
                    </button>
                    <button onClick={() => handleRefine('summarize')} disabled={isRefining} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[10px] text-white transition-colors">
                        Summarize
                    </button>
                    <button onClick={() => handleRefine('expand')} disabled={isRefining} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[10px] text-white transition-colors">
                        Expand
                    </button>
                    <button onClick={() => handleRefine('action_items')} disabled={isRefining} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[10px] text-white transition-colors">
                        Extract Actions
                    </button>

                    <div className="flex-grow" />
                    
                    <button 
                        onClick={toggleArchive}
                        className={`px-3 py-1 border rounded-md text-[10px] transition-colors ${status === 'Archived' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-transparent border-white/10 text-text-tertiary hover:text-white'}`}
                    >
                        {status === 'Archived' ? 'Restored' : 'Archive'}
                    </button>
                </div>

                {/* Metadata Bar */}
                <div className="flex flex-wrap gap-4 p-4 border-b border-white/10 bg-black/20 text-xs">
                    <div className="flex items-center space-x-2">
                        <span className="text-text-tertiary uppercase font-bold">Category:</span>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value as any)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-roman-aqua cursor-pointer"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 flex-grow">
                        <span className="text-text-tertiary uppercase font-bold">Tags:</span>
                        <input 
                            type="text" 
                            value={tags} 
                            onChange={e => setTags(e.target.value)}
                            placeholder="Comma, separated, tags"
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-full focus:outline-none focus:border-roman-aqua"
                        />
                    </div>
                </div>

                {/* Editor Body */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Write Pane */}
                    <div className={`flex-1 p-6 overflow-y-auto ${viewMode === 'preview' ? 'hidden md:block' : ''}`}>
                        <textarea 
                            value={content} 
                            onChange={e => setContent(e.target.value)}
                            placeholder="Write your protocol..."
                            className="w-full h-full bg-transparent text-text-primary font-mono text-sm leading-relaxed focus:outline-none resize-none"
                            spellCheck={false}
                        />
                    </div>

                    {/* Preview Pane (Split Screen) */}
                    <div className={`flex-1 p-6 overflow-y-auto bg-black/20 border-l border-white/5 ${viewMode === 'edit' ? 'hidden md:block' : ''}`}>
                        <div className="prose prose-invert max-w-none">
                            <MarkdownRenderer content={content || '*Empty Protocol*'} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
