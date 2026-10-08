
import React, { useState, useMemo } from 'react';
import BackButton from '../../components/shared/BackButton';
import { BookIcon } from '../../components/icons/BookIcon';
import { SearchIcon } from '../../components/icons/CommandPaletteIcons';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import type { View, Note } from '../../types';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { AnimatePresence, motion } from 'framer-motion';

interface NotepadViewProps {
    onNavigate: (view: View) => void;
    notes: Note[];
    saveNote: (note: Partial<Note>) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
    isLoading: boolean;
}

const TEMPLATES = [
    { title: 'Mission Brief', category: 'Strategy', tags: ['planning', 'brief'], content: '### Objective\n\n### Key Results\n1. \n2. \n3. \n\n### Risks\n' },
    { title: 'Agent Prompt', category: 'Prompts', tags: ['ai', 'weaver'], content: 'You are an expert agent specializing in [ROLE].\n\nYour goal is to [GOAL].\n\nConstraints:\n- ' },
    { title: 'Meeting Log', category: 'Logs', tags: ['meeting', 'notes'], content: 'Date: \nAttendees: \n\n### Agenda\n\n### Decisions\n\n### Action Items\n' },
];

type SortOption = 'newest' | 'oldest' | 'alpha';

const NotepadView: React.FC<NotepadViewProps> = ({ onNavigate, notes, saveNote, deleteNote, isLoading }) => {
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
    const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const filteredNotes = useMemo(() => {
        let result = notes.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
            
            // Filter out archived unless showArchived is true
            const isArchived = note.status === 'Archived';
            if (showArchived && !isArchived) return false;
            if (!showArchived && isArchived) return false;

            return matchesSearch && matchesCategory;
        });

        // Sorting
        result.sort((a, b) => {
            // Always prioritize pinned notes at the top if not viewing archive
            if (!showArchived) {
                if (a.status === 'Pinned' && b.status !== 'Pinned') return -1;
                if (a.status !== 'Pinned' && b.status === 'Pinned') return 1;
            }

            if (sortBy === 'newest') return b.updatedAt - a.updatedAt;
            if (sortBy === 'oldest') return a.updatedAt - b.updatedAt;
            if (sortBy === 'alpha') return a.title.localeCompare(b.title);
            return 0;
        });

        return result;
    }, [notes, searchQuery, selectedCategory, showArchived, sortBy]);

    const categories = ['All', 'Strategy', 'Prompts', 'Ideas', 'Logs', 'Drafts'];

    const handleCreateFromTemplate = (template: typeof TEMPLATES[0]) => {
        setEditingNote({
            title: `New ${template.title}`,
            category: template.category as any,
            tags: template.tags,
            content: template.content,
            status: 'Active'
        });
    };

    return (
        <div className="h-full w-full overflow-hidden flex flex-col p-3 md:p-5 relative high-density">
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                        <div className="h-8 w-px bg-white/10"></div>
                        <h1 className="text-2xl font-bold font-comfortaa text-white flex items-center gap-2">
                            <BookIcon className="w-6 h-6 text-roman-aqua" />
                            <span>The Codex</span>
                        </h1>
                    </div>
                    <button 
                        onClick={() => setEditingNote({})}
                        className="px-4 py-2 bg-roman-aqua hover:bg-white text-black font-bold rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(32,178,170,0.4)]"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden md:inline">New Shard</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-panel-bg/40 backdrop-blur-md p-3 rounded-xl border border-glass-border">
                    {/* Categories */}
                    <div className="flex space-x-1 overflow-x-auto max-w-full pb-1 xl:pb-0 custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-white/10 text-white border border-white/20' : 'text-text-tertiary hover:text-white hover:bg-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                         <div className="relative flex-grow sm:flex-grow-0 sm:w-48">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                            <input
                                type="text"
                                placeholder="Search shards..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-roman-aqua transition-colors"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-text-secondary focus:outline-none focus:border-roman-aqua cursor-pointer hover:text-white"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="alpha">A-Z</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary pointer-events-none" />
                            </div>

                            <button 
                                onClick={() => setShowArchived(!showArchived)}
                                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${showArchived ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-black/40 border-white/10 text-text-tertiary hover:text-white'}`}
                            >
                                {showArchived ? 'Hide Archives' : 'Archives'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Templates (Only shown when not archiving and no search) */}
            {!showArchived && !searchQuery && (
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                    {TEMPLATES.map((tmpl, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleCreateFromTemplate(tmpl)}
                            className="flex-shrink-0 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center gap-3 transition-colors group min-w-[180px]"
                        >
                            <div className="p-2 bg-black/30 rounded-lg text-roman-aqua group-hover:scale-110 transition-transform">
                                <PlusIcon className="w-3 h-3" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-white group-hover:text-roman-aqua">{tmpl.title}</div>
                                <div className="text-[9px] text-text-tertiary">{tmpl.category}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 pb-20">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-text-tertiary animate-pulse">
                        Accessing Memory Banks...
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-text-tertiary border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                        <BookIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">
                            {showArchived ? 'No archived shards found.' : searchQuery ? 'No shards match your query.' : 'The Codex is empty.'}
                        </p>
                        {!showArchived && (
                             <button onClick={() => setEditingNote({})} className="mt-4 text-roman-aqua hover:underline text-xs font-bold uppercase tracking-widest">
                                Initialize Protocol
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    onClick={() => setEditingNote(note)} 
                                    onDelete={deleteNote} 
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {editingNote && (
                    <NoteEditor 
                        note={editingNote} 
                        onSave={saveNote} 
                        onClose={() => setEditingNote(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotepadView;
