import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon } from '../icons/CommandPaletteIcons';
import { FingerPrintIcon } from '../icons/DirectorIcons';
import { CoinsIcon } from '../icons/EconomyIcons';
import type { CRMDeal, CRMContact } from '../../types';

interface SoulSearchProps {
    deals: CRMDeal[];
    contacts: CRMContact[];
    onSelectDeal: (id: string | number) => void;
    onSelectContact: (contact: CRMContact) => void;
}

export const SoulSearch: React.FC<SoulSearchProps> = ({ deals, contacts, onSelectDeal, onSelectContact }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const results = query.length > 1 ? {
        deals: deals.filter(d => d.company.toLowerCase().includes(query.toLowerCase()) || d.dealName.toLowerCase().includes(query.toLowerCase())),
        contacts: contacts.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.company.toLowerCase().includes(query.toLowerCase()))
    } : { deals: [], contacts: [] };

    const totalResults = results.deals.length + results.contacts.length;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className={`relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 transition-all ${isOpen ? 'ring-2 ring-roman-aqua/50 border-roman-aqua/50 shadow-[0_0_20px_rgba(32,178,170,0.2)]' : 'hover:border-white/20'}`}>
                <div className="pl-3 pr-2 text-text-tertiary">
                    <SearchIcon className="w-4 h-4" />
                </div>
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search Souls & Opportunities..."
                    className="w-full bg-transparent border-none outline-none py-2 text-sm text-white placeholder:text-white/20 font-lexend"
                />
                {query && (
                    <button onClick={() => setQuery('')} className="px-3 text-text-tertiary hover:text-white">✕</button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && query.length > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-panel-bg/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-[200] overflow-hidden flex flex-col max-h-[400px]"
                    >
                        <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Neural Index Results</span>
                            <span className="text-[10px] font-mono text-roman-aqua">{totalResults} found</span>
                        </div>
                        
                        <div className="overflow-y-auto custom-scrollbar">
                            {results.deals.length > 0 && (
                                <div className="p-2">
                                    <h4 className="px-2 py-1 text-[8px] font-black text-white/40 uppercase tracking-widest">Opportunities</h4>
                                    {results.deals.map(deal => (
                                        <button 
                                            key={deal.id}
                                            onClick={() => { onSelectDeal(deal.id); setQuery(''); setIsOpen(false); }}
                                            className="w-full p-3 rounded-xl hover:bg-white/5 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400">
                                                    <CoinsIcon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">{deal.company}</div>
                                                    <div className="text-[10px] text-text-tertiary">{deal.dealName}</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-mono text-patina-green">${(deal.value / 1000).toFixed(0)}k</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.contacts.length > 0 && (
                                <div className="p-2">
                                    <h4 className="px-2 py-1 text-[8px] font-black text-white/40 uppercase tracking-widest">Souls</h4>
                                    {results.contacts.map(contact => (
                                        <button 
                                            key={contact.id}
                                            onClick={() => { onSelectContact(contact); setQuery(''); setIsOpen(false); }}
                                            className="w-full p-3 rounded-xl hover:bg-white/5 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-roman-aqua/10 text-roman-aqua">
                                                    <FingerPrintIcon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white group-hover:text-roman-aqua transition-colors">{contact.name}</div>
                                                    <div className="text-[10px] text-text-tertiary">{contact.role} at {contact.company}</div>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-roman-aqua shadow-[0_0_8px_rgba(32,178,170,0.4)]" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {totalResults === 0 && (
                                <div className="p-12 text-center">
                                    <div className="text-white/20 italic text-sm">No neural matches found for "{query}"</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
