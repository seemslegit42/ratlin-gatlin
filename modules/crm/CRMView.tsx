/**
 * @file modules/crm/CRMView.tsx
 * @description The Sovereign's Nexus for Strategic Relationships.
 * Features comprehensive Pipeline Management, Deal Intelligence, and Contact Network visualization.
 */

import React, { useState, useMemo } from 'react';
import { PipelineColumn } from '../../components/crm/PipelineColumn';
import { RecentActivity } from '../../components/crm/RecentActivity';
import { ContactList } from '../../components/crm/ContactList';
import BackButton from '../../components/shared/BackButton';
import { LayersIcon } from '../../components/icons/LayersIcon';
import DealCreationModal from '../../components/crm/DealCreationModal';
import ContactCreationModal from '../../components/crm/ContactCreationModal';
import { ModuleCard } from '../shared/ModuleCard';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { FingerPrintIcon } from '../../components/icons/DirectorIcons';
import { CoinsIcon } from '../../components/icons/EconomyIcons';
import { RadarIcon } from '../../components/icons/SecurityIcons';
import { ListTodoIcon } from '../../components/icons/ListTodoIcon';
import { motion, AnimatePresence } from 'framer-motion';
import type { View, CRMDeal, CRMContact, CRMActivity, InfluenceLink } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';
import { MailIcon } from '../../components/icons/AetheriumIcons';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { StrategicInfluenceHeatmap } from '../../components/crm/StrategicInfluenceHeatmap';
import { SoulSearch } from '../../components/crm/SoulSearch';
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph';
import { sounds } from '../../utils/soundEffects';
import { SparkIcon } from '../../components/icons/SparkIcon';

interface CRMViewProps {
    onNavigate: (view: View) => void;
    pipeline: Record<string, CRMDeal[]>;
    activities: CRMActivity[];
    contacts: CRMContact[];
    influenceLinks: InfluenceLink[];
    isLoadingBrief: boolean;
    updateDeal: (deal: CRMDeal, stage: string) => Promise<void>;
    moveDeal: (dealId: string | number, targetStage: string) => Promise<void>;
    logActivity: (action: CRMActivity['action'], target: string, topic: string) => Promise<void>;
    addContact: (contact: Omit<CRMContact, 'id'>) => Promise<void>;
    addDeal: (deal: Omit<CRMDeal, 'id'>, stage?: string) => Promise<void>;
    generateTacticalStrategy: (dealId: string | number) => Promise<void>;
}

/**
 * Visualizes Relationship Influence between souls.
 */
const InfluenceNetwork: React.FC<{ contacts: CRMContact[]; links: InfluenceLink[] }> = ({ contacts, links }) => {
    return (
        <ModuleCard title="Influence Network Graph" icon={<FingerPrintIcon className="w-5 h-5 text-roman-aqua" />}>
            <div className="relative h-64 bg-black/40 rounded-xl border border-white/5 overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(106,13,173,0.05)_0%,transparent_70%)]" />
                
                <svg className="absolute inset-0 w-full h-full">
                    {links.map(link => {
                        const s = contacts.find(c => c.id === link.sourceId);
                        const t = contacts.find(c => c.id === link.targetId);
                        if (!s || !t) return null;
                        
                        // Fake positioning for demo
                        const x1 = (parseInt(s.id.substring(0, 2), 16) % 80) + 10;
                        const y1 = (parseInt(s.id.substring(2, 4), 16) % 80) + 10;
                        const x2 = (parseInt(t.id.substring(0, 2), 16) % 80) + 10;
                        const y2 = (parseInt(t.id.substring(2, 4), 16) % 80) + 10;

                        return (
                            <line 
                                key={link.id}
                                x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                                stroke="var(--roman-aqua)" strokeWidth={link.strength * 2} strokeOpacity="0.2"
                            />
                        );
                    })}
                </svg>

                {contacts.map((contact, i) => {
                    const x = (parseInt(contact.id.substring(0, 2), 16) % 80) + 10;
                    const y = (parseInt(contact.id.substring(2, 4), 16) % 80) + 10;

                    return (
                        <motion.div 
                            key={contact.id}
                            className="absolute cursor-pointer group/soul"
                            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                        >
                            <div 
                                className="w-4 h-4 rounded-full border border-white/40 shadow-lg group-hover/soul:scale-150 transition-transform" 
                                style={{ backgroundColor: contact.avatarColor || 'var(--imperial-purple)' }}
                            />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover/soul:opacity-100 bg-black/90 px-2 py-0.5 rounded text-[8px] text-white whitespace-nowrap z-50 transition-opacity">
                                {contact.name}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <p className="text-[10px] text-text-tertiary mt-3 leading-relaxed italic">
                Mapping the gravitational pull between key decision-makers across {new Set(contacts.map(c => c.company)).size} syndicates.
            </p>
        </ModuleCard>
    );
};

/**
 * Predictive Revenue Orbit
 */
const PredictiveRevenueOrbit: React.FC<{ pipeline: Record<string, CRMDeal[]> }> = ({ pipeline }) => {
    const metrics = useMemo(() => {
        const stageWeights: Record<string, number> = { 'Prospecting': 0.1, 'Qualification': 0.25, 'Proposal': 0.6, 'Negotiation': 0.85 };
        let total = 0, weighted = 0;
        Object.entries(pipeline).forEach(([stage, deals]) => {
            (deals as CRMDeal[]).forEach(d => { total += d.value; weighted += d.value * (stageWeights[stage] || 0.1); });
        });
        return { total, weighted };
    }, [pipeline]);

    const progress = (metrics.weighted / 1000000) * 100;

    return (
        <ModuleCard title="Revenue Projection" icon={<CoinsIcon className="w-5 h-5 text-yellow-400" />}>
            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle 
                            cx="50" cy="50" r="45" fill="none" stroke="var(--patina-green)" strokeWidth="8"
                            strokeDasharray="283" initial={{ strokeDashoffset: 283 }}
                            animate={{ strokeDashoffset: 283 - (2.83 * Math.min(100, progress)) }}
                            transition={{ duration: 1.5 }} strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-bold text-white">${(metrics.weighted / 1000).toFixed(0)}k</span>
                        <span className="text-[8px] text-text-tertiary uppercase tracking-widest font-bold">Weighted</span>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                        <div className="text-sm font-mono font-bold text-white">${(metrics.total / 1000).toFixed(0)}k</div>
                        <div className="text-[9px] uppercase font-bold text-text-tertiary">Raw Pipe</div>
                    </div>
                    <div className="text-center border-l border-white/10">
                        <div className="text-sm font-mono font-bold text-patina-green">{progress.toFixed(1)}%</div>
                        <div className="text-[9px] uppercase font-bold text-text-tertiary">Goal Hit</div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 w-full">
                    <p className="text-[10px] text-text-tertiary leading-snug">
                        Client sentiment analysis indicates <span className="text-patina-green font-bold">High Trust</span>. Churn probability {'<'} 2%.
                    </p>
                </div>
            </div>
        </ModuleCard>
    );
};

const ExecutionReadinessCard: React.FC<{ pipeline: Record<string, CRMDeal[]>; contacts: CRMContact[]; activities: CRMActivity[] }> = ({
    pipeline,
    contacts,
    activities,
}) => {
    const readiness = useMemo(() => {
        const allDeals = Object.values(pipeline).flat() as CRMDeal[];
        const highPriorityDeals = allDeals.filter(deal => deal.priority === 'High').length;
        const strategicCoverage = allDeals.filter(deal => deal.strategy).length;
        const activeCadence = activities.filter(activity => activity.action === 'called' || activity.action === 'emailed').length;
        const withKnownEmail = contacts.filter(contact => Boolean(contact.email)).length;
        const confidence = allDeals.length === 0 ? 0 : Math.round((strategicCoverage / allDeals.length) * 100);
        return {
            totalDeals: allDeals.length,
            highPriorityDeals,
            strategicCoverage,
            activeCadence,
            withKnownEmail,
            confidence,
        };
    }, [pipeline, contacts, activities]);

    return (
        <ModuleCard title="Execution Readiness Index" icon={<BrainIcon className="w-5 h-5 text-roman-aqua" />}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-text-tertiary">Strategic Coverage</p>
                        <p className="mt-1 text-lg font-bold text-white">{readiness.strategicCoverage}/{readiness.totalDeals}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-text-tertiary">Contact Hygiene</p>
                        <p className="mt-1 text-lg font-bold text-white">{readiness.withKnownEmail}/{contacts.length}</p>
                    </div>
                </div>
                <div>
                    <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-text-tertiary">
                        <span>Readiness Confidence</span>
                        <span className="text-roman-aqua">{readiness.confidence}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
                        <motion.div className="h-full bg-roman-aqua" animate={{ width: `${readiness.confidence}%` }} />
                    </div>
                </div>
                <div className="rounded-lg border border-patina-green/20 bg-patina-green/10 p-3 text-[10px] leading-relaxed text-text-secondary">
                    <span className="font-bold text-patina-green">Recommended next action:</span>{' '}
                    {readiness.highPriorityDeals > 0
                        ? `Launch high-touch follow-up for ${readiness.highPriorityDeals} priority deal(s) and require strategy refresh where missing.`
                        : 'Maintain proactive cadence; no blocked high-priority deals detected.'}
                </div>
                <p className="text-[10px] italic text-text-tertiary">
                    Cadence events logged: {readiness.activeCadence}. This panel aligns CRM execution quality to the autonomy guardrails in your operating model.
                </p>
            </div>
        </ModuleCard>
    );
};

// --- MAIN VIEW ---

const CRMView: React.FC<CRMViewProps> = (props) => {
    const { 
        onNavigate, pipeline, activities, contacts, influenceLinks, isLoadingBrief,
        updateDeal, moveDeal, logActivity, addContact, addDeal, generateTacticalStrategy 
    } = props;
    const { addNotification } = useNotifications();
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    
    // Modal States
    const [isDealModalOpen, setIsDealModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    
    // Sidebar States
    const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null);
    const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
    
    // Deal Editor States
    const [isEditingDeal, setIsEditingDeal] = useState(false);

    const handleDealSelect = (dealId: string | number) => {
        sounds.playGlassThrum();
        const deal = (Object.values(pipeline).flat() as CRMDeal[]).find(d => d.id === dealId || String(d.id) === String(dealId));
        if (deal) {
            setSelectedDeal(deal);
            setSelectedContact(null);
            setIsEditingDeal(false);
        }
    };

    const handleContactSelect = (contact: CRMContact) => {
        sounds.playCrystallineChime();
        setSelectedContact(contact);
        setSelectedDeal(null);
    };

    const handleDealUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedDeal) return;
        const formData = new FormData(e.currentTarget);
        const stage = formData.get('stage') as string;
        
        await updateDeal({
            ...selectedDeal,
            company: formData.get('company') as string,
            dealName: formData.get('dealName') as string,
            value: Number(formData.get('value')),
            priority: formData.get('priority') as any,
        }, stage);
        
        setIsEditingDeal(false);
        addNotification("Deal vectors recalibrated.", "success");
    };

    const handleGenerateTactical = async () => {
        if (!selectedDeal) return;
        addNotification(`Synthesizing tactical gambit for ${selectedDeal.company}...`, 'info');
        await generateTacticalStrategy(selectedDeal.id);
        addNotification("Tactical briefing ready.", "success");
    };

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 md:space-y-6 bg-obsidian-black/80 relative high-density">
            
            {/* Deal Strategy Sidebar */}
            <AnimatePresence>
                {selectedDeal && (
                    <motion.div 
                        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                        className="fixed right-0 top-0 bottom-0 w-[400px] z-[150] bg-panel-bg/95 backdrop-blur-3xl border-l border-white/10 p-6 shadow-2xl flex flex-col"
                    >
                        <header className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold font-comfortaa text-white">{selectedDeal.company}</h2>
                                <p className="text-xs text-roman-aqua font-mono uppercase tracking-widest">{selectedDeal.dealName}</p>
                            </div>
                            <button onClick={() => setSelectedDeal(null)} className="p-2 hover:bg-white/10 rounded-full text-text-tertiary transition-colors">✕</button>
                        </header>

                        <div className="flex-grow space-y-6 overflow-y-auto custom-scrollbar pr-2">
                            {isEditingDeal ? (
                                <form onSubmit={handleDealUpdateSubmit} className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-bold text-text-secondary uppercase">Edit Parameters</h4>
                                    <input name="company" defaultValue={selectedDeal.company} className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white" placeholder="Company" required />
                                    <input name="dealName" defaultValue={selectedDeal.dealName} className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white" placeholder="Deal Name" required />
                                    <input name="value" type="number" defaultValue={selectedDeal.value} className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white" placeholder="Value" required />
                                    <select
                                        name="priority"
                                        aria-label="Deal priority"
                                        defaultValue={selectedDeal.priority}
                                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => setIsEditingDeal(false)} className="px-3 py-1 text-xs text-text-tertiary hover:text-white">Cancel</button>
                                        <button type="submit" className="px-3 py-1 bg-roman-aqua text-black rounded text-xs font-bold hover:bg-white transition-colors">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center group cursor-pointer hover:bg-white/10 transition-all" onClick={() => setIsEditingDeal(true)}>
                                        <div className="text-[10px] uppercase text-text-tertiary font-bold mb-1 tracking-widest">Value</div>
                                        <div className="text-lg font-mono font-bold text-patina-green">${selectedDeal.value.toLocaleString()}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                        <div className="text-[10px] uppercase text-text-tertiary font-bold mb-1 tracking-widest">Resonance</div>
                                        <div className="text-lg font-mono font-bold text-roman-aqua">{selectedDeal.resonance || '--'}%</div>
                                    </div>
                                </div>
                            )}

                            {/* Activity Log / Quick Actions */}
                            <div className="flex justify-around bg-black/20 p-2 rounded-lg border border-white/5">
                                <button onClick={() => logActivity('emailed', selectedDeal.company, 'Follow-up Email')} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/5 transition-colors group">
                                    <div className="p-1.5 bg-pink-500/20 rounded-full text-pink-500 group-hover:scale-110 transition-transform"><MailIcon className="w-4 h-4"/></div>
                                    <span className="text-[9px] uppercase font-bold text-text-secondary">Log Email</span>
                                </button>
                                <button onClick={() => logActivity('called', selectedDeal.company, 'Discovery Call')} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/5 transition-colors group">
                                    <div className="p-1.5 bg-blue-500/20 rounded-full text-blue-500 group-hover:scale-110 transition-transform"><MicrophoneIcon className="w-4 h-4"/></div>
                                    <span className="text-[9px] uppercase font-bold text-text-secondary">Log Call</span>
                                </button>
                                <button onClick={() => setIsEditingDeal(true)} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/5 transition-colors group">
                                    <div className="p-1.5 bg-white/10 rounded-full text-white group-hover:scale-110 transition-transform"><ListTodoIcon className="w-4 h-4"/></div>
                                    <span className="text-[9px] uppercase font-bold text-text-secondary">Edit</span>
                                </button>
                            </div>

                            <ModuleCard title="Tactical Strategy Brief" icon={<BrainIcon className="w-5 h-5 text-imperial-purple" />}>
                                {selectedDeal.strategy ? (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-imperial-purple/10 border border-imperial-purple/30 rounded-lg">
                                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">The Gambit:</h4>
                                            <p className="text-sm italic text-imperial-purple font-bold">"{selectedDeal.strategy.gambit}"</p>
                                        </div>
                                        <ul className="space-y-2">
                                            {selectedDeal.strategy.tactics.map((t, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-roman-aqua mt-1 shrink-0" />
                                                    {t}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px]">
                                            <span className="text-text-tertiary uppercase">Risk Probability: <span className="text-red-400 font-bold">{selectedDeal.strategy.riskScore}%</span></span>
                                            <button 
                                                onClick={handleGenerateTactical}
                                                className="text-roman-aqua hover:underline"
                                            >
                                                Refresh Strategy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center space-y-4">
                                        <p className="text-xs text-text-tertiary italic">No active strategy brief for this deal.</p>
                                        <button 
                                            onClick={handleGenerateTactical}
                                            disabled={isLoadingBrief}
                                            className="px-6 py-2.5 bg-imperial-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-imperial-purple transition-all disabled:opacity-50"
                                        >
                                            {isLoadingBrief ? 'Synthesizing...' : 'Generate Gambit'}
                                        </button>
                                    </div>
                                )}
                            </ModuleCard>

                            <ModuleCard title="Operational Deployment" icon={<ListTodoIcon className="w-5 h-5 text-patina-green" />}>
                                <p className="text-[10px] text-text-tertiary mb-4 leading-relaxed">
                                    Transition this opportunity to the execution layer. Deployment will provision a dedicated "Deal War-Room" node in Operations.
                                </p>
                                <button
                                    onClick={() => {
                                        if (selectedDeal) {
                                            void logActivity('updated', selectedDeal.company, `Deal war-room opened in Operations`);
                                            addNotification(`Operations task created for ${selectedDeal.company}.`, 'success');
                                        }
                                        onNavigate('operations');
                                    }}
                                    className="w-full py-3 bg-patina-green/10 border border-patina-green/30 text-patina-green rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-patina-green hover:text-black transition-all"
                                >
                                    Launch Operations Task
                                </button>
                            </ModuleCard>
                            
                             {/* Engagement History History Filtered */}
                            <ModuleCard title="Engagement History">
                                <div className="space-y-4">
                                    {activities.filter(a => a.target === selectedDeal.company).map(act => (
                                        <div key={act.id} className="text-xs border-l-2 border-white/10 pl-3 relative">
                                            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-roman-aqua" />
                                            <p className="text-white">{act.action} - {act.topic}</p>
                                            <p className="text-text-tertiary text-[10px]">{act.time}</p>
                                        </div>
                                    ))}
                                    {activities.filter(a => a.target === selectedDeal.company).length === 0 && (
                                        <p className="text-[10px] text-text-tertiary italic">No specific activity recorded.</p>
                                    )}
                                </div>
                            </ModuleCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contact Inspector Sidebar */}
             <AnimatePresence>
                {selectedContact && (
                    <motion.div 
                        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                        className="fixed right-0 top-0 bottom-0 w-[400px] z-[150] bg-panel-bg/95 backdrop-blur-3xl border-l border-white/10 p-6 shadow-2xl flex flex-col"
                    >
                        <header className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg" style={{ backgroundColor: selectedContact.avatarColor || '#6A0DAD' }}>
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold font-comfortaa text-white">{selectedContact.name}</h2>
                                    <p className="text-xs text-text-secondary">{selectedContact.role} at {selectedContact.company}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-white/10 rounded-full text-text-tertiary transition-colors">✕</button>
                        </header>
                         <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-text-tertiary uppercase font-bold">Email</span>
                                    <span className="text-white select-all">{selectedContact.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-text-tertiary uppercase font-bold">Last Contact</span>
                                    <span className="text-white">{selectedContact.lastContact}</span>
                                </div>
                            </div>

                            <ModuleCard title="Influence Metrics">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-text-secondary">Network Gravity</span>
                                            <span className="text-roman-aqua font-bold">High</span>
                                        </div>
                                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-roman-aqua h-full w-[85%]" />
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-text-tertiary">
                                        This soul is connected to {influenceLinks.filter(l => l.sourceId === selectedContact.id || l.targetId === selectedContact.id).length} other entities in the graph.
                                    </div>
                                </div>
                            </ModuleCard>

                            <button
                                onClick={() => {
                                    if (selectedContact) {
                                        void logActivity('called', selectedContact.company, `Interaction with ${selectedContact.name}`);
                                        addNotification(`Interaction logged for ${selectedContact.name}.`, 'success');
                                    }
                                }}
                                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-xs text-text-secondary hover:text-white hover:border-roman-aqua/40 hover:bg-roman-aqua/5 transition-all"
                            >
                                Log Interaction
                            </button>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation & Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4 shrink-0">
                    <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                </div>
                
                <SoulSearch 
                    deals={Object.values(pipeline).flat() as CRMDeal[]}
                    contacts={contacts}
                    onSelectDeal={(id) => handleDealSelect(id)}
                    onSelectContact={handleContactSelect}
                />

                <div className="flex items-center space-x-2 shrink-0">
                    <button onClick={() => setIsDealModalOpen(true)} className="px-4 py-2 bg-patina-green/10 hover:bg-patina-green/20 border border-patina-green/40 text-patina-green rounded-xl text-xs font-bold transition-all">+ Generate Opportunity</button>
                    <button onClick={() => setIsContactModalOpen(true)} className="px-4 py-2 bg-roman-aqua/10 hover:bg-roman-aqua/20 border border-roman-aqua/40 text-roman-aqua rounded-xl text-xs font-bold transition-all">+ Add Soul</button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button 
                        onClick={() => setViewMode(v => v === 'kanban' ? 'list' : 'kanban')}
                        className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-text-secondary transition-all"
                    >
                        <LayersIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{viewMode === 'kanban' ? 'Kanban' : 'List'}</span>
                    </button>
                </div>
            </div>

            <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <CrystallineGlyph glyph="conduit" size="md" glowIntensity="high" />
                        <h1 className="text-3xl md:text-4xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-roman-aqua">Relationship Nexus</h1>
                    </div>
                    <p className="text-sm text-text-tertiary font-mono tracking-widest mt-1 uppercase tracking-[0.3em]">Market Dominion // Strategic Influence</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-roman-aqua/10 border border-roman-aqua/20 rounded-full">
                    <SparkIcon className="w-3.5 h-3.5 text-roman-aqua animate-pulse" />
                    <span className="text-[10px] font-bold text-roman-aqua uppercase tracking-widest">
                        Network Resonance 96.8% · High Gravitational Mass
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <PredictiveRevenueOrbit pipeline={pipeline} />
                <InfluenceNetwork contacts={contacts} links={influenceLinks} />
                <StrategicInfluenceHeatmap contacts={contacts} pipeline={pipeline} />
                <ExecutionReadinessCard pipeline={pipeline} contacts={contacts} activities={activities} />
                <ModuleCard title="Swarm Signal Pulse" icon={<RadarIcon className="w-5 h-5 text-red-500" />}>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-text-tertiary uppercase">Outreach Velocity</span>
                            <span className="text-patina-green">42 units / hr</span>
                        </div>
                        <div className="relative h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div className="h-full bg-roman-aqua" animate={{ width: '65%' }} />
                        </div>
                        <p className="text-[10px] text-text-secondary italic">
                            Agent 'Aetheria' is currently ghostwriting 14 personalized intros for Apex tier leads.
                        </p>
                        <button
                                    onClick={() => addNotification('High-Touch Protocol activated — agent cadence updated.', 'success')}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase text-white border border-white/10 rounded-lg transition-all"
                                >
                                    Initiate High-Touch Protocol
                                </button>
                     </div>
                </ModuleCard>
            </div>

            {/* ── Pipeline Board ── */}
            {viewMode === 'kanban' ? (
                <div className="space-y-3">
                    {/* Open stages */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 min-h-[400px]">
                        {(['Prospecting', 'Qualification', 'Proposal', 'Negotiation'] as const).map(stage => (
                            <div key={stage} className="h-full">
                                <PipelineColumn
                                    stage={stage}
                                    count={pipeline[stage]?.length || 0}
                                    items={pipeline[stage] || []}
                                    onDropDeal={moveDeal}
                                    onUpdateDeal={(d) => { setSelectedDeal(d); setIsEditingDeal(true); }}
                                    logActivity={logActivity}
                                    onSelectDeal={handleDealSelect}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Closed stages (Won / Lost) */}
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                        {(['Won', 'Lost'] as const).map(stage => (
                            <div key={stage}>
                                <PipelineColumn
                                    stage={stage}
                                    count={pipeline[stage]?.length || 0}
                                    items={pipeline[stage] || []}
                                    onDropDeal={moveDeal}
                                    onUpdateDeal={(d) => { setSelectedDeal(d); setIsEditingDeal(true); }}
                                    logActivity={logActivity}
                                    onSelectDeal={handleDealSelect}
                                    variant={stage === 'Won' ? 'won' : 'lost'}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* ── List View ── */
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm font-lexend">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-left">
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Company</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Deal</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Stage</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Value</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Priority</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Resonance</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(Object.entries(pipeline) as [string, CRMDeal[]][]).flatMap(([stage, deals]) =>
                                deals.map(deal => {
                                    const stagePill: Record<string, string> = {
                                        Prospecting: 'text-text-tertiary bg-white/5 border-white/10',
                                        Qualification: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                                        Proposal: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                                        Negotiation: 'text-imperial-purple bg-imperial-purple/10 border-imperial-purple/20',
                                        Won: 'text-patina-green bg-patina-green/10 border-patina-green/20',
                                        Lost: 'text-red-400 bg-red-400/10 border-red-400/20',
                                    };
                                    const resColor = (deal.resonance ?? 50) > 70 ? 'text-patina-green' : (deal.resonance ?? 50) < 40 ? 'text-red-400' : 'text-roman-aqua';
                                    return (
                                        <tr
                                            key={deal.id}
                                            onClick={() => handleDealSelect(deal.id)}
                                            className="hover:bg-white/4 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-3 font-bold text-white group-hover:text-roman-aqua transition-colors">{deal.company}</td>
                                            <td className="px-4 py-3 text-text-secondary text-xs">{deal.dealName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${stagePill[stage] ?? stagePill.Prospecting}`}>{stage}</span>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-patina-green">${deal.value.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[9px] font-bold ${deal.priority === 'High' ? 'text-yellow-400' : deal.priority === 'Medium' ? 'text-text-secondary' : 'text-text-tertiary'}`}>{deal.priority}</span>
                                            </td>
                                            <td className={`px-4 py-3 font-mono font-bold ${resColor}`}>{deal.resonance ?? '—'}%</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); void logActivity('emailed', deal.company, 'Follow-up sent'); }} className="p-1 rounded text-text-tertiary hover:text-patina-green transition-colors" title="Log email">
                                                        <MailIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); void logActivity('called', deal.company, 'Discovery call'); }} className="p-1 rounded text-text-tertiary hover:text-roman-aqua transition-colors" title="Log call">
                                                        <MicrophoneIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            {Object.values(pipeline).flat().length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-text-tertiary text-xs italic">No deals in pipeline. Add your first opportunity.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <RecentActivity activities={activities} />
                <ContactList contacts={contacts} onSelectContact={handleContactSelect} />
            </div>

            {/* Creation Modals */}
            <DealCreationModal 
                isOpen={isDealModalOpen}
                onClose={() => setIsDealModalOpen(false)}
                onCreate={(deal) => addDeal(deal)}
            />
            <ContactCreationModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onCreate={(contact) => addContact(contact)}
            />
        </div>
    );
};

export default CRMView;