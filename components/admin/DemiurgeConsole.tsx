/**
 * @file components/admin/DemiurgeConsole.tsx
 * @description The Demiurge: Your personal, all-powerful administrative agent.
 * Executes complex system commands through simple conversation using Ollama tools.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrownIcon } from '../icons/CrownIcon';
import { SendIcon } from '../icons/SendIcon';
import { runDemiurge } from '../../services/ollamaService';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { telemetry } from '../../services/telemetryService';
import { tablesDB } from '../../services/appwriteClient';
import { useNotifications } from '../../contexts/NotificationContext';
import { ID } from 'appwrite';

interface DemiurgeConsoleProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    sender: 'Sovereign' | 'Demiurge';
    text: string;
    type?: 'text' | 'action' | 'alert';
}

const QUICK_COMMANDS = [
    "Grant 500 Xi to Treasury (Reason: Stimulus)",
    "Broadcast Critical Alert: 'System maintenance in 10m'",
    "List all users in the Syndicate",
    "Analyze recent system telemetry"
];

export const DemiurgeConsole: React.FC<DemiurgeConsoleProps> = ({ isOpen, onClose }) => {
    const { currentUser, syndicateId } = useAuth();
    const { agents } = useWorkflowState(syndicateId || '', currentUser?.id);
    const { addNotification } = useNotifications();
    
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<Message[]>([
        { id: 'init', sender: 'Demiurge', text: 'I await your command, Sovereign. The system is listening.', type: 'text' }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !currentUser) return;

        // 1. Add User Message
        const userMsg: Message = { id: Date.now().toString(), sender: 'Sovereign', text };
        setHistory(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        try {
            // 2. Prepare Context
            /* Fix: Explicitly cast contextData to any to satisfy JsonObject parameter constraint due to complex telemetry type */
            const contextData: any = {
                syndicateId: currentUser.syndicateId,
                agentCount: Object.keys(agents).length,
                balance: currentUser.xiBalance,
                telemetry: telemetry.getMetrics()
            };
            
            const conversationHistory = history.map(m => ({ sender: m.sender, text: m.text }));

            // 3. Call AI
            const response = await runDemiurge(text, conversationHistory, contextData);
            
            let responseText = response.text || "Command executed without output.";
            let msgType: Message['type'] = 'text';

            // 4. Handle Tool Calls
            if (response.functionCalls && response.functionCalls.length > 0) {
                msgType = 'action';
                for (const call of response.functionCalls) {
                    const args = call.args as any;
                    
                    if (call.name === 'broadcast_alert') {
                        addNotification(args.message, args.severity === 'critical' ? 'error' : 'info');
                        // TODO: Persist to Appwrite chat_messages table
                        // await tablesDB.createRow({
                        //   databaseId: BROADCAST_DB_ID,
                        //   tableId: CHAT_MESSAGES_TABLE_ID,
                        //   data: {
                        //     syndicate_id: currentUser.syndicateId,
                        //     source: 'SYSTEM',
                        //     content: `[BROADCAST] ${args.message}`,
                        //     timestamp: Date.now()
                        //   }
                        // });
                        responseText += `\n[Broadcast Sent: ${args.severity}]`;
                    }
                    else if (call.name === 'grant_resources') {
                        // TODO: Persist to Appwrite treasury_transactions table
                        // await tablesDB.createRow({
                        //   databaseId: TREASURY_DB_ID,
                        //   tableId: TREASURY_TRANSACTIONS_TABLE_ID,
                        //   data: {
                        //     syndicate_id: currentUser.syndicateId,
                        //     type: 'accrual',
                        //     amount: args.amount,
                        //     description: `Demiurge Grant: ${args.reason}`,
                        //     timestamp: Date.now()
                        //   }
                        // });
                        responseText += `\n[Treasury Updated: +${args.amount} Xi]`;
                    }
                    else if (call.name === 'query_users') {
                        // TODO: Query Appwrite users table
                        // const result = await tablesDB.listRows({
                        //   databaseId: USERS_DB_ID,
                        //   tableId: USERS_TABLE_ID,
                        //   queries: [Query.equal('syndicate_id', currentUser.syndicateId)]
                        // });
                        // const userList = result.documents?.map((u: any) => u.name).join(', ') || 'None';
                        const userList = 'None';
                        responseText += `\n[User Query Result]: ${userList}`;
                    }
                }
            }

            // 5. Add Response Message
            const demiurgeMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                sender: 'Demiurge', 
                text: responseText, 
                type: msgType
            };
            setHistory(prev => [...prev, demiurgeMsg]);

        } catch (error) {
            console.error("Demiurge Error:", error);
            setHistory(prev => [...prev, { id: Date.now().toString(), sender: 'Demiurge', text: "A synaptic fault occurred processing your will.", type: 'alert' }]);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-[#0a0a0c] border border-imperial-purple/30 rounded-2xl shadow-[0_0_50px_rgba(106,13,173,0.3)] overflow-hidden flex flex-col relative"
                style={{ height: '70vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-imperial-purple/20 to-transparent p-4 border-b border-imperial-purple/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-imperial-purple/20 rounded-lg border border-imperial-purple/50 shadow-[0_0_15px_rgba(106,13,173,0.5)]">
                            <CrownIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-comfortaa font-bold text-xl text-white">The Demiurge</h2>
                            <p className="text-[10px] text-imperial-purple uppercase tracking-[0.3em] font-mono">Administrative Omnipotence</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">✕</button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <CrownIcon className="w-64 h-64 text-white" />
                    </div>

                    {history.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'Sovereign' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] ${msg.sender === 'Sovereign' ? 'bg-white/10 text-right' : 'bg-black/40 border border-imperial-purple/20'} p-4 rounded-2xl relative overflow-hidden`}>
                                {msg.type === 'action' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-patina-green" />}
                                {msg.type === 'alert' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                                
                                <p className="text-xs font-bold text-text-tertiary mb-1 uppercase tracking-wider">{msg.sender}</p>
                                <p className="text-sm text-vitreous-white font-lexend leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </motion.div>
                    ))}
                    
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-black/40 border border-imperial-purple/20 p-4 rounded-2xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-imperial-purple rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-imperial-purple rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-imperial-purple rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/10">
                    {/* Quick Suggestions */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 custom-scrollbar">
                        {QUICK_COMMANDS.map((cmd, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(cmd)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-imperial-purple/10 border border-imperial-purple/30 text-[10px] text-imperial-purple hover:bg-imperial-purple/30 hover:text-white transition-all font-mono"
                            >
                                {cmd}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Invoke your will..."
                            className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-imperial-purple focus:ring-1 focus:ring-imperial-purple transition-all"
                            autoFocus
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isProcessing}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-imperial-purple text-white hover:bg-imperial-purple/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};