
/**
 * @file components/marketing/PersonaLab.tsx
 * @description An interactive sandbox where users can test marketing copy against simulated
 * customer personas. Features a chat interface and emotional resonance scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { BrainIcon } from '../icons/BrainIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { SendIcon } from '../icons/SendIcon';

interface Persona {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
    description: string;
    bias: 'Skeptical' | 'Enthusiastic' | 'Budget-Conscious' | 'Technical';
}

const PERSONAS: Persona[] = [
    { id: '1', name: 'Marcus Chen', role: 'CTO, Series B Startup', avatar: 'M', color: 'bg-blue-500', description: 'Hates buzzwords. Cares about scalability, uptime, and documentation. Very busy.', bias: 'Skeptical' },
    { id: '2', name: 'Sarah Jenkins', role: 'VP of Marketing', avatar: 'S', color: 'bg-pink-500', description: 'Looking for ROI and brand alignment. Needs to justify spend to the CEO.', bias: 'Budget-Conscious' },
    { id: '3', name: 'Alex Vane', role: 'Indie Hacker', avatar: 'A', color: 'bg-purple-500', description: 'Loves new tech. Impulsive buyer if it saves time. Easily bored.', bias: 'Enthusiastic' },
];

interface ChatMessage {
    id: string;
    sender: 'user' | 'persona';
    text: string;
    sentiment?: number; // 0-100
}

export const PersonaLab: React.FC = () => {
    const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
        setChatHistory(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response Logic
        setTimeout(() => {
            const responseText = generateMockResponse(selectedPersona, input);
            const sentimentScore = calculateMockSentiment(selectedPersona, input);
            
            const personaMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'persona', 
                text: responseText,
                sentiment: sentimentScore
            };
            
            setChatHistory(prev => [...prev, personaMsg]);
            setIsTyping(false);
        }, 1500);
    };

    // Heuristic response generator for demo purposes
    const generateMockResponse = (persona: Persona, text: string): string => {
        const lower = text.toLowerCase();
        if (persona.bias === 'Skeptical') {
            if (lower.includes('synergy') || lower.includes('revolutionary') || lower.includes('ai')) return "Stop with the buzzwords. What's the latency? Do you have an SLA?";
            if (lower.includes('cost') || lower.includes('price')) return "I don't care about price yet. Does it actually work at scale?";
            return "That's vague. Give me technical specs.";
        }
        if (persona.bias === 'Enthusiastic') {
            if (lower.includes('new') || lower.includes('launch')) return "Ooh, shiny! Can I get early access? Does it have an API?";
            return "Sounds cool. Does it integrate with Notion?";
        }
        if (persona.bias === 'Budget-Conscious') {
             if (lower.includes('value') || lower.includes('roi')) return "Okay, but what's the payback period? My budget is tight this quarter.";
             return "Is there a free tier? I need to test before I commit.";
        }
        return "Interesting. Tell me more.";
    };

    const calculateMockSentiment = (persona: Persona, text: string) => {
        // Random sentiment weighted by persona bias
        const base = Math.random() * 40 + 30;
        if (persona.bias === 'Skeptical') return Math.min(100, Math.max(0, base - 10));
        if (persona.bias === 'Enthusiastic') return Math.min(100, Math.max(0, base + 20));
        return Math.round(base);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Persona Selector */}
            <ModuleCard title="Target Profile" className="col-span-1">
                <div className="space-y-4">
                    {PERSONAS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => { setSelectedPersona(p); setChatHistory([]); }}
                            className={`w-full p-3 rounded-xl border flex items-center space-x-3 transition-all ${selectedPersona.id === p.id ? `bg-white/10 border-white/30` : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${p.color} shadow-lg`}>
                                {p.avatar}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm text-white">{p.name}</div>
                                <div className="text-[10px] text-text-tertiary">{p.role}</div>
                            </div>
                        </button>
                    ))}
                    
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="text-xs font-bold text-text-secondary uppercase mb-2">Psychographic Profile</h4>
                        <p className="text-xs text-text-tertiary leading-relaxed italic">"{selectedPersona.description}"</p>
                        <div className="mt-3 flex gap-2">
                            <span className="px-2 py-1 bg-white/5 rounded text-[9px] font-mono text-roman-aqua border border-white/10">Bias: {selectedPersona.bias}</span>
                            <span className="px-2 py-1 bg-white/5 rounded text-[9px] font-mono text-patina-green border border-white/10">Tech Savvy: High</span>
                        </div>
                    </div>
                </div>
            </ModuleCard>

            {/* Simulation Chamber */}
            <ModuleCard title="Simulation Chamber" className="col-span-1 lg:col-span-2 relative">
                <div className="flex flex-col h-full">
                    {/* Chat Area */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-4 bg-black/20 rounded-lg mb-4 border border-white/5 relative" ref={scrollRef}>
                        {chatHistory.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-text-tertiary opacity-30 flex-col">
                                <BrainIcon className="w-12 h-12 mb-2" />
                                <p className="text-xs">Initiate contact to test resonance.</p>
                            </div>
                        )}
                        
                        {chatHistory.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-imperial-purple/20 text-white rounded-br-none border border-imperial-purple/30' : 'bg-white/10 text-white rounded-bl-none border border-white/10'}`}>
                                    {msg.text}
                                    {msg.sender === 'persona' && msg.sentiment !== undefined && (
                                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-[9px] text-text-tertiary uppercase">Resonance</span>
                                            <span className={`text-[10px] font-bold ${msg.sentiment > 70 ? 'text-patina-green' : msg.sentiment < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {msg.sentiment}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/10">
                        <button className="p-2 text-text-tertiary hover:text-white transition-colors">
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <input 
                            type="text" 
                            className="flex-grow bg-transparent border-none focus:ring-0 text-sm text-white placeholder-text-tertiary"
                            placeholder={`Pitch to ${selectedPersona.name}...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            className="p-2 bg-roman-aqua text-black rounded-lg hover:bg-white transition-colors shadow-lg shadow-roman-aqua/20"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
};
