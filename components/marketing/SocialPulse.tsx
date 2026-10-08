
/**
 * @file components/marketing/SocialPulse.tsx
 * @description Visualizes real-time social sentiment, trending hashtags, and a live "stream" of mentions.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { TrendingUpIcon } from '../icons/VitalsIcons';
import { ShareIcon } from '../icons/MarketingIcons';

interface SocialMention {
    id: string;
    user: string;
    handle: string;
    platform: 'Twitter' | 'LinkedIn' | 'Reddit';
    content: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    timestamp: string;
}

const MOCK_MENTIONS: SocialMention[] = [
    { id: '1', user: 'TechCrunch', handle: '@TechCrunch', platform: 'Twitter', content: 'ΛΞVON OS is redefining the agentic workspace. Huge if true.', sentiment: 'positive', timestamp: '2m ago' },
    { id: '2', user: 'DevRel', handle: '@code_wizard', platform: 'Twitter', content: 'Trying to set up the API keys. Documentation is a bit sparse?', sentiment: 'neutral', timestamp: '5m ago' },
    { id: '3', user: 'SaaS Critic', handle: '@saas_roast', platform: 'LinkedIn', content: 'Another dashboard app? The UI looks slick but does it scale?', sentiment: 'negative', timestamp: '12m ago' },
    { id: '4', user: 'AI Daily', handle: '@aidaily', platform: 'Reddit', content: 'The Weaver interface is actually insane. Visual programming done right.', sentiment: 'positive', timestamp: '15m ago' },
];

export const SocialPulse: React.FC = () => {
    const [mentions, setMentions] = useState<SocialMention[]>(MOCK_MENTIONS);

    // Simulate live feed
    useEffect(() => {
        const interval = setInterval(() => {
            const newMention: SocialMention = {
                id: Date.now().toString(),
                user: 'New User ' + Math.floor(Math.random() * 100),
                handle: '@user_' + Math.floor(Math.random() * 1000),
                platform: Math.random() > 0.5 ? 'Twitter' : 'Reddit',
                content: 'Just discovered this tool. The glassmorphism is on point!',
                sentiment: Math.random() > 0.3 ? 'positive' : 'neutral',
                timestamp: 'Just now'
            };
            setMentions(prev => [newMention, ...prev.slice(0, 4)]);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Sentiment Gauge */}
            <ModuleCard title="Global Sentiment" className="col-span-1">
                <div className="flex flex-col items-center justify-center h-full py-4">
                    <div className="relative w-40 h-40">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                            <motion.circle 
                                cx="50" cy="50" r="45" fill="none" stroke="#3EB991" strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset="40" // Approx 85%
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 40 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-patina-green">85%</span>
                            <span className="text-[10px] uppercase text-text-tertiary tracking-widest">Positive</span>
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-6 w-full px-4">
                        <div className="flex-1 text-center">
                            <div className="text-lg font-bold text-white">1.2k</div>
                            <div className="text-[9px] text-text-tertiary uppercase">Mentions</div>
                        </div>
                        <div className="flex-1 text-center border-l border-white/10">
                            <div className="text-lg font-bold text-roman-aqua">4.8</div>
                            <div className="text-[9px] text-text-tertiary uppercase">Virality Score</div>
                        </div>
                    </div>
                </div>
            </ModuleCard>

            {/* Live Feed */}
            <ModuleCard title="Signal Stream" className="col-span-1 lg:col-span-2">
                <div className="flex flex-col h-full overflow-hidden relative">
                     <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-panel-bg to-transparent z-10" />
                     <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2 py-2">
                        <AnimatePresence initial={false}>
                            {mentions.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-3 bg-white/5 rounded-lg border border-white/5 flex gap-3"
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${m.platform === 'Twitter' ? 'bg-blue-400' : m.platform === 'LinkedIn' ? 'bg-blue-700' : 'bg-orange-500'}`}>
                                            {m.user[0]}
                                        </div>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-sm font-bold text-white mr-2">{m.user}</span>
                                                <span className="text-xs text-text-tertiary">{m.handle}</span>
                                            </div>
                                            <span className="text-[10px] text-text-tertiary">{m.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1">{m.content}</p>
                                    </div>
                                    <div className={`w-1 flex-shrink-0 rounded-full ${m.sentiment === 'positive' ? 'bg-patina-green' : m.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                     </div>
                </div>
            </ModuleCard>
        </div>
    );
};
