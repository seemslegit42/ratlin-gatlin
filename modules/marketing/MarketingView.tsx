
/**
 * @file modules/marketing/MarketingView.tsx
 * @description The Command Center for Syndicate Growth. 
 * Orchestrates brand narrative, customer acquisition, and interactive simulations.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketingMetrics } from '../../components/marketing/MarketingMetrics';
import { CampaignTable } from '../../components/marketing/CampaignTable';
import { ContentCalendar } from '../../components/marketing/ContentCalendar';
import { AdPerformanceMatrix } from '../../components/marketing/AdPerformanceMatrix';
import { CampaignWarRoom } from '../../components/marketing/CampaignWarRoom'; 
import { PersonaLab } from '../../components/marketing/PersonaLab';
import { CreativeStudio } from '../../components/marketing/CreativeStudio';
import { SocialPulse } from '../../components/marketing/SocialPulse';
import { BazaarWidget } from '../../components/marketing/BazaarWidget';
import { CompetitorScout } from '../../components/marketing/CompetitorScout';
import { BudgetAlchemist } from '../../components/marketing/BudgetAlchemist';
import { InventoryVelocity } from '../../components/marketing/InventoryVelocity';
import { MarketingOpsConsole } from '../../components/marketing/MarketingOpsConsole'; // Added
import { InfluencerGraph } from '../../components/marketing/InfluencerGraph'; // Added
import { AudiencePrism } from '../../components/marketing/AudiencePrism'; // Added

import BackButton from '../../components/shared/BackButton';
import { TrendingUpIcon, ZapIcon } from '../../components/icons/VitalsIcons';
import { ChartBarIcon, CoinsIcon } from '../../components/icons/EconomyIcons';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { RadarIcon } from '../../components/icons/SecurityIcons';
import { ModuleCard } from '../shared/ModuleCard';
import type { View, CRMContact, CRMActivity } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../contexts/AuthContext';
import { MailIcon } from '../../components/icons/AetheriumIcons';
import { EmailMarketingLab } from '../../components/marketing/email/EmailMarketingLab';
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph';
import { sounds } from '../../utils/soundEffects';

interface MarketingViewProps {
    onNavigate: (view: View) => void;
    contacts?: CRMContact[];
    activities?: CRMActivity[];
    currentUserId?: string | null;
}

type Tab = 'warroom' | 'acquisition' | 'intel' | 'signal' | 'commerce' | 'lab' | 'email';

const MarketingView: React.FC<MarketingViewProps> = ({
    onNavigate,
    contacts = [],
    activities = [],
    currentUserId = null,
}) => {
    const { syndicateId } = useAuth();
    const [activeTab, setActiveTab] = useLocalStorage<Tab>(`marketing-active-tab-${syndicateId}`, 'warroom');

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'warroom', label: 'War Room', icon: <LayersIcon className="w-4 h-4" /> },
        { id: 'email', label: 'Email Lab', icon: <MailIcon className="w-4 h-4" /> },
        { id: 'intel', label: 'Intelligence', icon: <RadarIcon className="w-4 h-4" /> },
        { id: 'acquisition', label: 'Acquisition', icon: <ZapIcon className="w-4 h-4" /> },
        { id: 'signal', label: 'Signal', icon: <TrendingUpIcon className="w-4 h-4" /> },
        { id: 'commerce', label: 'Bazaar', icon: <CoinsIcon className="w-4 h-4" /> },
        { id: 'lab', label: 'Persona Lab', icon: <BrainIcon className="w-4 h-4" /> },
    ];
    const tabContext: Record<Tab, { title: string; detail: string }> = {
        warroom: {
            title: 'Campaign Control Plane',
            detail: 'Track pipeline performance, adjust campaign priorities, and coordinate execution timing in one place.'
        },
        email: {
            title: 'Email Marketing Studio',
            detail: 'Compose responsive templates with drag-and-drop blocks, bind dynamic CRM segments, and schedule sends with time zones and send-time optimization.'
        },
        intel: {
            title: 'Market Intelligence',
            detail: 'Read competitor movement and audience composition before changing spend, creative, or channel mix.'
        },
        acquisition: {
            title: 'Acquisition Engineering',
            detail: 'Tune budget, ad performance, and creative payloads to improve cost-efficiency and conversion quality.'
        },
        signal: {
            title: 'Signal Monitoring',
            detail: 'Use social and calendar signals to understand momentum, pacing, and content consistency over time.'
        },
        commerce: {
            title: 'Revenue Conversion Surface',
            detail: 'Bridge storefront activity with inventory timing so demand capture does not break delivery confidence.'
        },
        lab: {
            title: 'Persona Development',
            detail: 'Refine customer archetypes and messaging variants to align campaigns with high-intent segments.'
        }
    };

    return (
        <div className="h-full w-full overflow-hidden flex flex-col p-3 md:p-5 bg-obsidian-black/80 high-density">
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center space-x-4 mb-4">
                    <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Growth Engine
                        </h1>
                        <p className="text-sm text-text-tertiary font-body tracking-widest mt-1">
                            STRATEGIC INFLUENCE // AUDIENCE SYNTHESIS
                        </p>
                    </div>
                    <div className="flex space-x-1 bg-black/20 p-1 rounded-xl mt-4 md:mt-0 overflow-x-auto max-w-full border border-white/5 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    sounds.playCrystallineChime();
                                    setActiveTab(tab.id);
                                }}
                                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    activeTab === tab.id ? 'text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="marketing-tab-bg"
                                        className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg shadow-sm"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 opacity-70">{tab.icon}</span>
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <ModuleCard title="Marketing Playbook" className="mb-6" icon={<ChartBarIcon className="w-5 h-5 text-roman-aqua" />}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Current Focus</p>
                            <p className="text-sm font-bold text-white mt-1">{tabContext[activeTab].title}</p>
                            <p className="text-xs text-text-secondary mt-2">{tabContext[activeTab].detail}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Decision Rule</p>
                            <p className="text-xs text-text-secondary mt-2">Change one growth lever at a time, observe signal quality, then scale only when trend and cost move in the same direction.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Recommended Next Step</p>
                            <p className="text-xs text-text-secondary mt-2">If momentum stalls, move to <span className="text-white font-semibold">Intelligence</span> first, then return to <span className="text-white font-semibold">Acquisition</span> with updated assumptions.</p>
                        </div>
                    </div>
                </ModuleCard>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="h-full space-y-6"
                    >
                        {activeTab === 'warroom' && (
                            <>
                                <MarketingMetrics />
                                <CampaignWarRoom />
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <CampaignTable />
                                </div>
                                <MarketingOpsConsole />
                            </>
                        )}

                        {activeTab === 'email' && syndicateId && currentUserId && (
                            <EmailMarketingLab
                                syndicateId={syndicateId}
                                userId={currentUserId}
                                contacts={contacts}
                                activities={activities}
                            />
                        )}
                        {activeTab === 'email' && (!syndicateId || !currentUserId) && (
                            <ModuleCard title="Email Lab">
                                <p className="text-sm text-text-secondary">
                                    Sign in to load and save the email studio. Appwrite persistence requires an authenticated session.
                                </p>
                            </ModuleCard>
                        )}

                        {activeTab === 'intel' && (
                            <div className="space-y-6">
                                <CompetitorScout />
                                <AudiencePrism />
                            </div>
                        )}

                        {activeTab === 'acquisition' && (
                            <div className="space-y-6">
                                <BudgetAlchemist />
                                <AdPerformanceMatrix />
                                <CreativeStudio />
                            </div>
                        )}
                        
                        {activeTab === 'signal' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                                    <SocialPulse />
                                    <ContentCalendar />
                                </div>
                                <InfluencerGraph />
                            </div>
                        )}
                        
                        {activeTab === 'commerce' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ModuleCard title="The Bazaar: Storefront"><BazaarWidget /></ModuleCard>
                                <ModuleCard title="Inventory Velocity">
                                    <InventoryVelocity />
                                </ModuleCard>
                            </div>
                        )}
                        
                        {activeTab === 'lab' && (
                            <PersonaLab />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MarketingView;
