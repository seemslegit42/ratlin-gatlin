
/**
 * @file components/weaver/InspectorPanel.tsx
 * @description The Command Deck for individual Agents and Global Workflow settings.
 * Enhanced for Magenta Ki: Memory Observability (CoALA).
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, InteractionStyle } from '../../types';
import { AgentStatus, AgentType } from '../../types';
import { AGENT_ICONS, AGENT_STATUS_STYLES, getAgentAvatar } from '../../utils/agent-visuals';
import { JSONTree } from './Node';
import { 
    LogicIcon, DataIcon, CreativityIcon, DatabaseIcon, 
    RouterIcon 
} from '../icons/AetheriumIcons';
import { ChainIcon } from '../icons/ChainIcon';
import { LayersIcon } from '../icons/LayersIcon';
import { PlayIcon, TrashIcon, UploadIcon } from '../icons/CommandPaletteIcons';
import { SaveIcon } from '../icons/SaveIcon';
import { CogIcon, ExclamationIcon } from '../icons/AgentStatusIcons';
import { runFastAnalysis } from '../../services/ollamaService';
import { ZapIcon } from '../icons/QuickActionIcons';
import { PlusIcon } from '../icons/PlusIcon';
import { PinIcon } from '../icons/PinIcon';
import { PinOffIcon } from '../icons/PinOffIcon';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { BrainIcon } from '../icons/BrainIcon';
import { nanoid } from 'nanoid';
import { storage, BUCKETS } from '../../services/appwriteClient';
import { WizardIcon } from '../icons/WizardIcon';
import { SparkIcon } from '../icons/SparkIcon';
import { CodeExecutionTerminal } from './CodeExecutionTerminal';
// TODO: Migrate persistence to Appwrite Databases API

// --- Types ---

interface InspectorPanelProps {
    agent: Agent | null; 
    allAgents: Record<string, Agent>; 
    onUpdate: (agentId: string, updates: Partial<Agent>) => void;
    onDelete: (agentId: string) => void;
    onClose: () => void; 
    onRun: (agentId: string) => void;
    onSaveTemplate: (agent: Agent, name: string) => void;
    onStartConnection: (agentId: string, portId?: string) => void;
    onDuplicate: (agentId: string) => void; 
    className?: string;
    workflowMeta?: { name: string; description: string }; 
    onUpdateWorkflow?: (meta: { name: string; description: string }) => void;
    onSynthesizeAvatar: (agent: Agent) => Promise<void>;
}

type InspectorTab = 'config' | 'observe' | 'memory' | 'dna';

interface Snapshot {
    id: string;
    name: string;
    timestamp: number;
    data: Partial<Agent>;
}

// --- Sub-Components ---

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-white/5">
        {icon && <span className="text-roman-aqua opacity-80">{icon}</span>}
        <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-lexend">{title}</h4>
    </div>
);

const MetricPill: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
    <div className="flex flex-col bg-black/20 p-2 rounded-lg border border-white/5">
        <span className="text-[9px] text-text-tertiary uppercase font-lexend">{label}</span>
        <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
    </div>
);

const MemoryModule: React.FC<{ title: string; items: string[] | string; color: string }> = ({ title, items, color }) => (
    <div className="bg-black/40 rounded-xl border border-white/5 p-3 hover:border-white/20 transition-all">
        <div className="flex items-center gap-2 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: color }} />
            <h5 className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{title}</h5>
        </div>
        <div className="text-[10px] text-text-tertiary font-mono leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
            {Array.isArray(items) ? (
                items.length > 0 ? (
                    <ul className="space-y-1">
                        {items.map((item, i) => <li key={i} className="border-l border-white/10 pl-2">{item}</li>)}
                    </ul>
                ) : (
                    <span className="italic opacity-50">// No records retrieved.</span>
                )
            ) : (
                <p className="whitespace-pre-wrap">{items || <span className="italic opacity-50">// Store empty.</span>}</p>
            )}
        </div>
    </div>
);

const SnapshotsList: React.FC<{ 
    snapshots: Snapshot[], 
    onRestore: (data: Partial<Agent>) => void,
    onDelete: (id: string) => void
}> = ({ snapshots, onRestore, onDelete }) => (
    <div className="space-y-3 mt-3">
        {snapshots.length === 0 && (
            <div className="text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-xs text-text-tertiary italic font-lexend">No behavioral snapshots recorded.</p>
                <p className="text-[9px] text-text-tertiary mt-1">Archive agent states to enable temporal reversion.</p>
            </div>
        )}
        <AnimatePresence>
            {snapshots.map((snap, i) => (
                <motion.div 
                    key={snap.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col p-3 bg-black/40 rounded-xl border border-white/5 hover:border-roman-aqua/30 transition-all group relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                            <span className="text-xs font-bold text-white font-comfortaa block">{snap.name}</span>
                            <span className="text-[9px] text-text-tertiary font-mono">{new Date(snap.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRestore(snap.data); }}
                                className="px-2 py-1 bg-roman-aqua/10 hover:bg-roman-aqua/20 text-roman-aqua rounded text-[9px] font-bold uppercase tracking-wider transition-colors border border-roman-aqua/20"
                                title="Restore this state"
                            >
                                Restore
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(snap.id); }}
                                className="p-1 text-text-tertiary hover:text-red-400 transition-colors rounded hover:bg-white/5"
                                title="Delete snapshot"
                            >
                                <TrashIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

const DNARadar: React.FC<{ metrics: Agent['metrics'] }> = ({ metrics }) => {
    const keys = ['clarity', 'celerity', 'acuity', 'resilience', 'iqi'] as const;
    const labels = ['CLA', 'CEL', 'ACU', 'RES', 'IQI'];
    
    const points = keys.map((key, i) => {
        const val = metrics[key] || 0;
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = (val / 100) * 40; 
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const outerWeb = keys.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = 50 + 40 * Math.cos(angle);
        const y = 50 + 40 * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="relative w-full aspect-square max-w-[180px] mx-auto my-6">
             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <polygon points={outerWeb} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
                <motion.polygon 
                    points={points} 
                    fill="rgba(62, 185, 145, 0.2)" 
                    stroke="var(--patina-green)" 
                    strokeWidth="1.5"
                    initial={{ scale: 0, opacity: 0, transformOrigin: 'center' }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                />
             </svg>
        </div>
    );
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ 
    agent, allAgents, onUpdate, onDelete, onClose, onRun, onSaveTemplate, onStartConnection, onDuplicate, className,
    workflowMeta = { name: 'Untitled Protocol', description: '' },
    onUpdateWorkflow, onSynthesizeAvatar
}) => {
    const [activeTab, setActiveTab] = useState<InspectorTab>('config');
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [pinnedAgentId, setPinnedAgentId] = useLocalStorage<string | null>('weaver-pinned-agent-id', null);
    
    const [wfName, setWfName] = useState(workflowMeta.name);
    const [wfDesc, setWfDesc] = useState(workflowMeta.description);

    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [analysisTip, setAnalysisTip] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayedAgent = useMemo(() => {
        if (pinnedAgentId && allAgents[pinnedAgentId]) {
            return allAgents[pinnedAgentId];
        }
        return agent;
    }, [pinnedAgentId, agent, allAgents]);

    const isPinned = displayedAgent?.id === pinnedAgentId;

    const handleTogglePin = () => {
        if (isPinned) {
            setPinnedAgentId(null);
        } else if (displayedAgent) {
            setPinnedAgentId(displayedAgent.id);
        }
    };
    
    const handleUpdateData = (key: string, value: any) => {
        if (displayedAgent) {
            onUpdate(displayedAgent.id, { data: { ...displayedAgent.data, [key]: value } });
        }
    };

    const handleQuickScan = async () => {
        if (!displayedAgent) return;
        setIsAnalyzing(true);
        const tip = await runFastAnalysis(displayedAgent.data);
        setAnalysisTip(tip);
        setIsAnalyzing(false);
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!displayedAgent || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        setIsUploading(true);
        try {
            const fileId = nanoid();
            await storage.createFile(BUCKETS.AVATARS, fileId, file);

            const rawView = storage.getFileView(BUCKETS.AVATARS, fileId) as unknown;
            let href = '';
            if (rawView !== null && rawView !== undefined) {
              if (typeof rawView === 'object' && 'href' in rawView && typeof (rawView as URL).href === 'string') {
                href = (rawView as URL).href;
              } else {
                href = String(rawView);
              }
            }

            if (!href) throw new Error('Empty avatar URL from storage.');
            onUpdate(displayedAgent.id, { avatar: href });
        } catch (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            alert('Failed to upload avatar.');
        }
        setIsUploading(false);
    };

    const handleGenerateMythicAvatar = async () => {
        if (!displayedAgent) return;
        setIsSynthesizing(true);
        try {
            await onSynthesizeAvatar(displayedAgent);
        } catch (error) {
            console.error('Error synthesizing mythic avatar:', error);
            alert('Failed to synthesize avatar.');
        } finally {
            setIsSynthesizing(false);
        }
    };

    if (!displayedAgent) {
        return (
            <div className={`bg-panel-bg/95 backdrop-blur-xl border-l border-glass-border w-full h-full flex flex-col shadow-2xl ${className || ''}`}>
                <div className="p-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center space-x-2 mb-1">
                        <LayersIcon className="w-4 h-4 text-roman-aqua" />
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-lexend">Workflow Metadata</span>
                    </div>
                    <h3 className="font-bold font-comfortaa text-white text-xl">Global Settings</h3>
                </div>
                
                <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar text-white">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 tracking-wider font-lexend">Protocol Name</label>
                            <input
                                type="text"
                                value={wfName}
                                onChange={(e) => {
                                    setWfName(e.target.value);
                                    onUpdateWorkflow?.({ name: e.target.value, description: wfDesc });
                                }}
                                className="w-full bg-black/40 border border-white/10 focus:border-roman-aqua rounded-lg p-3 text-sm text-white font-bold outline-none transition-all"
                                placeholder="Untitled Protocol"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 tracking-wider font-lexend">Description</label>
                            <textarea
                                value={wfDesc}
                                onChange={(e) => {
                                    setWfDesc(e.target.value);
                                    onUpdateWorkflow?.({ name: wfName, description: e.target.value });
                                }}
                                className="w-full bg-black/40 border border-white/10 focus:border-roman-aqua rounded-lg p-3 text-sm text-text-secondary outline-none transition-all h-32 resize-none"
                                placeholder="Describe the purpose of this workflow..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`bg-panel-bg/95 backdrop-blur-xl border-l w-full h-full flex flex-col shadow-2xl relative ${isPinned ? 'border-l-2 border-roman-aqua' : 'border-l-glass-border'} ${className || ''}`}>
            
            <div className="flex-shrink-0 p-5 border-b border-white/10 bg-white/5 flex justify-between items-start backdrop-blur-md z-10">
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <div 
                            className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 overflow-hidden cursor-pointer flex items-center justify-center relative"
                            style={{ color: AGENT_STATUS_STYLES[displayedAgent.status]?.glowColor || 'white' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading || isSynthesizing ? (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-roman-aqua border-t-transparent rounded-full animate-spin mb-1" />
                                </div>
                            ) : (
                                <>
                                    {getAgentAvatar(displayedAgent)}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <UploadIcon className="w-4 h-4 text-white" />
                                    </div>
                                </>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload} 
                            className="hidden" 
                            accept="image/*"
                            aria-label="Upload agent avatar"
                            title="Upload agent avatar"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            value={displayedAgent.name}
                            onChange={(e) => onUpdate(displayedAgent.id, { name: e.target.value })}
                            className="bg-transparent border-none p-0 text-lg font-bold font-comfortaa text-white focus:ring-0 focus:outline-none w-40 truncate"
                            aria-label="Agent name"
                            title="Agent name"
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${displayedAgent.status === 'Running' ? 'bg-roman-aqua animate-pulse' : 'bg-text-tertiary'}`} />
                            <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest">{displayedAgent.type}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={handleTogglePin} className="text-white/30 hover:text-white transition-colors p-1" title={isPinned ? "Unpin" : "Pin"}>
                        {isPinned ? <PinIcon className="w-5 h-5 text-roman-aqua" /> : <PinOffIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1" aria-label="Close inspector" title="Close inspector">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex border-b border-white/5 bg-black/20 p-1">
                {['config', 'observe', 'memory', 'dna'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as InspectorTab)}
                        className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded transition-all font-lexend ${
                            activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-text-tertiary hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'config' && (
                        <motion.div key="config" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 font-lexend">Protocol Brief</label>
                                <textarea
                                    value={displayedAgent.description || ''}
                                    onChange={(e) => onUpdate(displayedAgent.id, { description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-vitreous-white outline-none h-24 resize-none"
                                    placeholder="Agent purpose..."
                                />
                            </div>

                            {displayedAgent.type === AgentType.CognitiveCore && (
                                <div>
                                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 font-lexend">System Prompt</label>
                                    <textarea
                                    value={(displayedAgent.data.prompt as string) || ''}
                                        onChange={(e) => handleUpdateData('prompt', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-vitreous-white font-mono h-36 resize-none"
                                        placeholder="Directives..."
                                    />
                                </div>
                            )}

                            <div className="p-3 bg-imperial-purple/10 border border-imperial-purple/20 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase text-imperial-purple">Magenta Ki Optimization</span>
                                    <button onClick={handleQuickScan} disabled={isAnalyzing} className="text-[9px] text-white hover:underline">Scan</button>
                                </div>
                                {analysisTip && <p className="text-xs text-text-secondary italic">"{analysisTip}"</p>}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'memory' && (
                        <motion.div key="memory" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                            <SectionHeader title="CoALA Memory Modules" icon={<DatabaseIcon className="w-3 h-3"/>} />
                            
                            <MemoryModule title="Working Memory (Scratchpad)" items={displayedAgent.memory.working} color="#FACC15" />
                            <MemoryModule title="Episodic Memory (Events)" items={displayedAgent.memory.episodic} color="#EC4899" />
                            <MemoryModule title="Semantic Memory (Facts)" items={displayedAgent.memory.semantic} color="#20B2AA" />
                            <MemoryModule title="Procedural Memory (Skills)" items={displayedAgent.memory.procedural} color="#6A0DAD" />
                            
                            <div className="pt-2 text-center">
                                <p className="text-[9px] text-text-tertiary uppercase tracking-widest">
                                    Magenta Ki: Thought Before Action
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'observe' && (
                        <motion.div key="observe" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                            {(displayedAgent.type === AgentType.CodeExecution || displayedAgent.type === AgentType.WasmExecutor) && (
                                <div>
                                    <SectionHeader title="Execution Terminal" icon={<WizardIcon className="w-3 h-3" />} />
                                    <CodeExecutionTerminal agent={displayedAgent} />
                                </div>
                            )}
                            <SectionHeader title="Output Artifact" icon={<LogicIcon className="w-3 h-3"/>} />
                            <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-[10px] text-patina-green h-64 overflow-auto custom-scrollbar">
                                {displayedAgent.outputData ? <JSONTree data={displayedAgent.outputData} /> : <span className="italic opacity-30">// Awaiting context...</span>}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'dna' && (
                        <motion.div key="dna" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                            <DNARadar metrics={displayedAgent.metrics} />
                            <div className="grid grid-cols-2 gap-2">
                                <MetricPill label="Resilience" value={`${displayedAgent.metrics.resilience}%`} color="text-patina-green" />
                                <MetricPill label="Intelligence" value={displayedAgent.metrics.iqi} color="text-imperial-purple" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20 space-y-3">
                <button onClick={() => onRun(displayedAgent.id)} className="w-full py-2.5 bg-patina-green text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg">
                    Execute Magenta Unit
                </button>
                <div className="flex justify-between px-1">
                    <button onClick={() => onDelete(displayedAgent.id)} className="text-[9px] font-bold text-red-900/60 hover:text-red-500 uppercase">Terminate</button>
                    <button onClick={() => onDuplicate(displayedAgent.id)} className="text-[9px] font-bold text-text-tertiary hover:text-white uppercase">Replicate</button>
                </div>
            </div>
        </div>
    );
};
