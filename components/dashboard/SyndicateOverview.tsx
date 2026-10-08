
/**
 * @file components/dashboard/SyndicateOverview.tsx
 * @description A dashboard widget that provides a high-level summary of the Syndicate's 
 * operational modules (CRM, Marketing, Security), acting as a central nervous system monitor.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { View } from '../../types';
import { ShieldIcon } from '../icons/SecurityIcons';
import { UserGroupIcon } from '../icons/CommandPaletteIcons';
import { MegaphoneIcon } from '../icons/MarketingIcons';
import { FolderIcon } from '../icons/QuickActionIcons';

interface SyndicateOverviewProps {
    onNavigate: (view: View) => void;
}

const ModuleStatus: React.FC<{ 
    label: string; 
    value: string; 
    sub: string; 
    icon: React.ReactNode; 
    color: string; 
    view: View;
    onNavigate: (view: View) => void;
}> = ({ label, value, sub, icon, color, view, onNavigate }) => (
    <button 
        onClick={() => onNavigate(view)}
        className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg transition-all group w-full text-left"
    >
        <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-black/20 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <div className="text-xs font-bold text-vitreous-white">{label}</div>
                <div className="text-[10px] text-text-tertiary">{sub}</div>
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm font-mono font-bold text-white">{value}</div>
        </div>
    </button>
);

const SyndicateOverview: React.FC<SyndicateOverviewProps> = ({ onNavigate }) => {
    return (
        <div className="bg-panel-bg/60 backdrop-blur-2xl border border-glass-border rounded-2xl p-6 shadow-glass flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-comfortaa font-bold text-lg text-vitreous-white">Syndicate Pulse</h3>
                    <p className="text-xs text-text-secondary mt-1">Operational Overview</p>
                </div>
                <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-patina-green rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-roman-aqua rounded-full animate-pulse delay-75" />
                    <span className="w-2 h-2 bg-imperial-purple rounded-full animate-pulse delay-150" />
                </div>
            </div>

            <div className="flex-grow space-y-3">
                <ModuleStatus 
                    label="CRM Pipeline" 
                    value="$420k" 
                    sub="3 Deals Closing" 
                    icon={<UserGroupIcon className="w-4 h-4" />} 
                    color="text-blue-400"
                    view="crm"
                    onNavigate={onNavigate}
                />
                <ModuleStatus 
                    label="Active Campaigns" 
                    value="4" 
                    sub="ROAS 4.2x" 
                    icon={<MegaphoneIcon className="w-4 h-4" />} 
                    color="text-pink-500"
                    view="marketing"
                    onNavigate={onNavigate}
                />
                <ModuleStatus 
                    label="Security Status" 
                    value="98%" 
                    sub="Threat Level: Low" 
                    icon={<ShieldIcon className="w-4 h-4" />} 
                    color="text-patina-green"
                    view="security"
                    onNavigate={onNavigate}
                />
                <ModuleStatus 
                    label="Procurement" 
                    value="2 POs" 
                    sub="Pending Approval" 
                    icon={<FolderIcon className="w-4 h-4" />} 
                    color="text-orange-400"
                    view="procurement"
                    onNavigate={onNavigate}
                />
            </div>
        </div>
    );
};

export default SyndicateOverview;
