
import React from 'react';
import { motion } from 'framer-motion';
import { MegaphoneIcon } from '../icons/MarketingIcons';
import { FingerPrintIcon, CalendarEventIcon } from '../icons/DirectorIcons';

interface DirectorTrayProps {
    onNudge?: () => void;
    onBroadcast?: () => void;
    onOrganize?: () => void;
}

interface ActionCardProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    styles: {
        container: string;
        iconBg: string;
        iconText: string;
    };
    description: string;
}

const ACTION_CARDS: ActionCardProps[] = [
    { 
        id: 'nudge',
        label: 'Nudge', 
        icon: <FingerPrintIcon className="w-6 h-6" />, 
        styles: {
            container: "bg-roman-aqua/10 border-roman-aqua/50 hover:bg-roman-aqua/20 shadow-[0_0_15px_rgba(32,178,170,0.2)] hover:shadow-[0_0_25px_rgba(32,178,170,0.4)]",
            iconBg: "bg-roman-aqua/20",
            iconText: "text-roman-aqua"
        },
        description: 'Apply subtle pressure' 
    },
    { 
        id: 'broadcast',
        label: 'Broadcast', 
        icon: <MegaphoneIcon className="w-6 h-6" />, 
        styles: {
            container: "bg-imperial-purple/10 border-imperial-purple/50 hover:bg-imperial-purple/20 shadow-[0_0_15px_rgba(106,13,173,0.2)] hover:shadow-[0_0_25px_rgba(106,13,173,0.4)]",
            iconBg: "bg-imperial-purple/20",
            iconText: "text-imperial-purple"
        },
        description: 'Send message to all' 
    },
    { 
        id: 'organize',
        label: 'Organize', 
        icon: <CalendarEventIcon className="w-6 h-6" />, 
        styles: {
            container: "bg-patina-green/10 border-patina-green/50 hover:bg-patina-green/20 shadow-[0_0_15px_rgba(62,185,145,0.2)] hover:shadow-[0_0_25px_rgba(62,185,145,0.4)]",
            iconBg: "bg-patina-green/20",
            iconText: "text-patina-green"
        },
        description: 'Schedule event' 
    },
];

export const DirectorTray: React.FC<DirectorTrayProps> = ({ onNudge, onBroadcast, onOrganize }) => {
    const handleAction = (id: string) => {
        if (id === 'nudge' && onNudge) onNudge();
        if (id === 'broadcast' && onBroadcast) onBroadcast();
        if (id === 'organize' && onOrganize) onOrganize();
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-end justify-center space-x-4 pointer-events-none">
            {ACTION_CARDS.map((card) => (
                <motion.div
                    key={card.label}
                    className="pointer-events-auto group relative flex flex-col items-center justify-end"
                    whileHover={{ y: -10 }}
                    onClick={() => handleAction(card.id)}
                >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs text-vitreous-white whitespace-nowrap pointer-events-none">
                        {card.description}
                    </div>

                    {/* Card */}
                    <motion.div
                        className={`w-20 h-28 backdrop-blur-md border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${card.styles.container}`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className={`p-2 rounded-full mb-2 ${card.styles.iconBg} ${card.styles.iconText}`}>
                            {card.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">{card.label}</span>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};
