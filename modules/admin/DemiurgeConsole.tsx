
/**
 * @file modules/admin/DemiurgeConsole.tsx
 * @description The Demiurge: Your personal administrative agent.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrownIcon } from '../../components/icons/CrownIcon';
import { SendIcon } from '../../components/icons/SendIcon';
import { runDemiurge } from '../../services/ollamaService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface DemiurgeConsoleProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DemiurgeConsole: React.FC<DemiurgeConsoleProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { addNotification } = useNotifications();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<any[]>([
        { sender: 'Demiurge', text: 'Root access granted. Command the machine, Sovereign.' }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [history, isProcessing]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        setHistory(prev => [...prev, { sender: 'Sovereign', text: msg }]);
        setIsProcessing(true);

        try {
            const context = { syndicateId: currentUser?.syndicateId, balance: currentUser?.xiBalance };
            const res = await runDemiurge(msg, history, context);
            setHistory(prev => [...prev, { sender: 'Demiurge', text: res.text }]);
            
            if (res.functionCalls?.length) {
                res.functionCalls.forEach(call => {
                    if (call.name === 'broadcast_alert') addNotification(call.args.message as string, 'info');
                    if (call.name === 'grant_resources') addNotification(`Resources Granted: ${call.args.amount} Xi`, 'success');
                });
            }
        } catch (e) {
            setHistory(prev => [...prev, { sender: 'Demiurge', text: 'Synaptic fault in root process.' }]);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-[#0a0a0c] border border-imperial-purple/30 rounded-2xl shadow-2xl h-[70vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-imperial-purple/10 p-4 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <CrownIcon className="w-6 h-6 text-imperial-purple" />
                        <h2 className="font-comfortaa font-bold text-white uppercase tracking-widest">Root_Demiurge</h2>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white">✕</button>
                </div>
                <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4">
                    {history.map((m, i) => (
                        <div key={i} className={`flex ${m.sender === 'Sovereign' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender === 'Sovereign' ? 'bg-white/5 text-right' : 'bg-imperial-purple/10 border border-imperial-purple/20 text-white'}`}>
                                <p className="text-[10px] font-bold text-text-tertiary mb-1 uppercase">{m.sender}</p>
                                <p className="font-lexend">{m.text}</p>
                            </div>
                        </div>
                    ))}
                    {isProcessing && <div className="text-[10px] text-roman-aqua animate-pulse uppercase font-mono">Thinking...</div>}
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Execute root command..." className="flex-grow bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-imperial-purple outline-none" />
                    <button onClick={handleSend} className="p-2 bg-imperial-purple rounded-lg text-white"><SendIcon className="w-5 h-5"/></button>
                </div>
            </motion.div>
        </motion.div>
    );
};
