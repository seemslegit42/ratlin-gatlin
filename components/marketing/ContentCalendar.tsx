
/**
 * @file components/marketing/ContentCalendar.tsx
 * @description A rich visual scheduler for orchestrating cross-platform content.
 * Integrates with Agent states to show who is currently crafting specific nodes of the brand narrative.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ClockIcon, MailIcon } from '../icons/AetheriumIcons';
import { ShareIcon, MegaphoneIcon } from '../icons/MarketingIcons';

interface ScheduledContent {
    id: string;
    title: string;
    platform: 'X' | 'LinkedIn' | 'Instagram' | 'YouTube' | 'Email';
    type: 'Thread' | 'Article' | 'Reel' | 'Video' | 'Newsletter';
    status: 'Drafting' | 'Review' | 'Scheduled' | 'Published';
    date: string;
    agent: string;
    color: string;
}

const SCHEDULE: ScheduledContent[] = [
    { id: '1', title: 'The Future of SRP', platform: 'LinkedIn', type: 'Article', status: 'Review', date: 'Oct 24', agent: 'Copywriter_01', color: 'bg-blue-600' },
    { id: '2', title: 'Swarm Dynamics Teaser', platform: 'X', type: 'Thread', status: 'Drafting', date: 'Oct 25', agent: 'Aetheria-9', color: 'bg-slate-800' },
    { id: '3', title: 'Verdigris Protocol v2', platform: 'Instagram', type: 'Reel', status: 'Scheduled', date: 'Oct 26', agent: 'Visual_Synth', color: 'bg-pink-600' },
    { id: '4', title: 'Quarterly Earnings Re-cap', platform: 'Email', type: 'Newsletter', status: 'Drafting', date: 'Oct 27', agent: 'Auditor_Bot', color: 'bg-patina-green' },
    { id: '5', title: 'Live Coding: Weaver', platform: 'YouTube', type: 'Video', status: 'Scheduled', date: 'Oct 28', agent: 'Dev_Advocate', color: 'bg-red-600' },
];

const PlatformIcon: React.FC<{ platform: ScheduledContent['platform'] }> = ({ platform }) => {
    switch (platform) {
        case 'X': return <span className="font-bold text-[10px]">𝕏</span>;
        case 'LinkedIn': return <span className="font-bold text-[10px]">in</span>;
        case 'Instagram': return <ShareIcon className="w-3 h-3" />;
        case 'Email': return <MailIcon className="w-3 h-3" />;
        case 'YouTube': return <MegaphoneIcon className="w-3 h-3" />;
        default: return null;
    }
};

const ContentSlot: React.FC<{ item: ScheduledContent }> = ({ item }) => (
    <motion.div 
        whileHover={{ x: 4 }}
        className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
    >
        {/* Date/Status Pillar */}
        <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-white/10 pr-4">
            <span className="text-[10px] font-mono text-text-tertiary uppercase">{item.date.split(' ')[0]}</span>
            <span className="text-lg font-bold text-white leading-none">{item.date.split(' ')[1]}</span>
        </div>

        {/* Content Details */}
        <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-white ${item.color} shadow-sm shadow-black/50`}>
                    <PlatformIcon platform={item.platform} />
                </div>
                <span className="text-[9px] font-bold text-roman-aqua uppercase tracking-widest">{item.type}</span>
            </div>
            <h4 className="text-sm font-bold text-vitreous-white truncate group-hover:text-white transition-colors">{item.title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-text-tertiary">Agent: <span className="text-patina-green">{item.agent}</span></span>
            </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-end">
            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                item.status === 'Scheduled' ? 'text-patina-green border-patina-green/30 bg-patina-green/10' :
                item.status === 'Review' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10 animate-pulse' :
                item.status === 'Published' ? 'text-roman-aqua border-roman-aqua/30 bg-roman-aqua/10' :
                'text-text-tertiary border-white/10 bg-white/5'
            }`}>
                {item.status}
            </div>
            {item.status === 'Scheduled' && (
                <div className="flex items-center gap-1 mt-2 text-text-tertiary">
                     <ClockIcon className="w-3 h-3" />
                     <span className="text-[9px] font-mono italic">09:00 AM</span>
                </div>
            )}
        </div>
    </motion.div>
);

export const ContentCalendar: React.FC = () => {
    return (
        <ModuleCard 
            title="Narrative Orchestration" 
            icon={<ClockIcon className="w-5 h-5 text-roman-aqua" />}
            action={<button className="text-[10px] font-bold text-roman-aqua hover:underline uppercase tracking-widest">+ New Slot</button>}
        >
            <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between text-xs text-text-secondary px-2 border-b border-white/5 pb-2">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-patina-green" /> Approved</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Pending</span>
                    </div>
                    <span className="font-mono">W-42 CYCLE</span>
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {SCHEDULE.map(item => (
                        <ContentSlot key={item.id} item={item} />
                    ))}
                </div>

                <div className="mt-auto pt-4 bg-gradient-to-t from-panel-bg to-transparent">
                    <div className="p-3 bg-imperial-purple/10 border border-imperial-purple/20 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-imperial-purple/20 rounded-lg text-imperial-purple animate-pulse">
                            <MegaphoneIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Sync Integrity</h5>
                            <p className="text-[9px] text-text-secondary leading-tight">
                                Narrative coherence is at 94%. Cross-platform sentiment alignment verified by Brand Guard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ModuleCard>
    );
};
