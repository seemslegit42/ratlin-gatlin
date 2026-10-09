
/**
 * @file components/MicroAppForgeView.tsx
 * @description The "Anvil" - A specialized IDE for constructing Agentic Micro-Apps.
 * Features a split-pane design: 
 * Left: "The Loom" (Logic Graph / Switchboard)
 * Center: "The Codex" (Vibe Coding Editor)
 * Right: "The Artifact" (Live Preview)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { View, CurrentUser } from '../types';
import { useMicroAppForgeState } from '../hooks/useMicroAppForgeState';
import { useNotifications } from '../contexts/NotificationContext'; 
import BackButton from './shared/BackButton';
import { CodeEditor } from './forge/CodeEditor';
import { LivePreviewFrame } from './forge/LivePreviewFrame';
import { LogicGraph } from './forge/LogicGraph';
import { ZapIcon } from './icons/VitalsIcons';
import { SaveIcon } from './icons/SaveIcon';
import { generateMicroAppCode } from '../services/ollamaService'; 
import MobileNav from './MobileNav';
import { useBreakpoint } from '../hooks/useBreakpoint'; 

interface MicroAppForgeViewProps {
    onNavigate: (view: View) => void;
    currentUser: CurrentUser;
}

type ForgeTab = 'code' | 'logic';

const MicroAppForgeView: React.FC<MicroAppForgeViewProps> = ({ onNavigate, currentUser }) => {
    const { addNotification } = useNotifications();
    const { 
        activeCode, activeAppName, isDraftSaving, updateDraft, publishMicroApp 
    } = useMicroAppForgeState(currentUser.syndicateId, currentUser.id);
    
    // IDE State
    const isMobile = useBreakpoint();
    const [activeTab, setActiveTab] = useState<ForgeTab>('code');
    const [mobileTab, setMobileTab] = useState('canvas'); // 'canvas' | 'chat' | 'preview'
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastCompiled, setLastCompiled] = useState(Date.now());

    // Handle "Vibe Coding" Generation
    const handleSpark = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        addNotification("Spark Initiated: Consulting the Neural Lattice...", "info");
        
        try {
            const generatedCode = await generateMicroAppCode(prompt, activeCode);
            updateDraft(generatedCode, activeAppName);
            setLastCompiled(Date.now());
            addNotification("Protocol Synthesized.", "success");
        } catch (error) {
            addNotification("Spark Fizzled: Generation failed.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!activeAppName.trim()) return;
        try {
            await publishMicroApp(activeAppName, "Generated via The Anvil", activeCode);
            addNotification(`"${activeAppName}" published to Syndicate Registry.`, "success");
        } catch (e) {
            addNotification("Publishing Failed.", "error");
        }
    };

    return (
        <div className="h-full w-full bg-[#050505] flex flex-col font-lexend overflow-hidden relative high-density">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Header / Toolbar */}
            <div className="h-16 flex-shrink-0 border-b border-white/10 bg-panel-bg/80 backdrop-blur-md flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex flex-col justify-center">
                        <input 
                            type="text" 
                            value={activeAppName}
                            onChange={(e) => updateDraft(activeCode, e.target.value)}
                            className="bg-transparent text-white font-bold font-comfortaa focus:outline-none focus:border-b border-white/20 transition-all w-64 text-sm"
                            placeholder="Untitled Protocol"
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isDraftSaving ? 'bg-yellow-400' : 'bg-patina-green'}`} />
                            <span className="text-[9px] text-text-tertiary uppercase tracking-wider font-mono">
                                {isDraftSaving ? 'SYNCING...' : 'SAVED'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'code' ? 'bg-imperial-purple text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                        >
                            Code
                        </button>
                        <button 
                            onClick={() => setActiveTab('logic')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'logic' ? 'bg-roman-aqua text-black shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                        >
                            Logic Graph
                        </button>
                    </div>
                    <button 
                        onClick={handlePublish}
                        className="flex items-center gap-2 px-4 py-2 bg-patina-green hover:bg-white text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                        <SaveIcon className="w-4 h-4" />
                        <span>Publish</span>
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative z-10">
                
                {/* Left Pane: Editor & Logic */}
                <div className={`${isMobile && mobileTab === 'preview' ? 'hidden' : 'flex'} w-full md:w-1/2 flex-col border-r border-white/10 bg-black/20 h-full`}>
                    
                    {/* The Spark Bar (AI Input) - Only visible in Code Mode */}
                    {activeTab === 'code' && (!isMobile || mobileTab === 'chat' || mobileTab === 'canvas') && (
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-imperial-purple to-roman-aqua rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur-md ${isGenerating ? 'animate-pulse' : ''}`} />
                                <div className="relative flex items-center bg-black/80 border border-white/10 rounded-xl p-1">
                                    <input 
                                        type="text" 
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSpark()}
                                        placeholder="Describe your Micro-App logic (e.g. 'Create a KPI card that glows red if value < 50')..."
                                        className="flex-grow bg-transparent text-sm text-white px-3 py-2 focus:outline-none placeholder-white/30 font-mono"
                                    />
                                    <button 
                                        onClick={handleSpark}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-imperial-purple text-white transition-all disabled:opacity-50"
                                    >
                                        <ZapIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-grow overflow-hidden relative">
                        {activeTab === 'code' ? (
                            <CodeEditor 
                                code={activeCode} 
                                onChange={(val) => updateDraft(val, activeAppName)} 
                                isReadOnly={isGenerating}
                            />
                        ) : (
                            <LogicGraph
                                syndicateId={currentUser.syndicateId}
                                authenticatedUserId={currentUser.id}
                            />
                        )}
                    </div>
                </div>

                {/* Right Pane: Live Preview (The Artifact) */}
                <div className={`${isMobile && mobileTab !== 'preview' ? 'hidden' : 'flex'} w-full md:w-1/2 flex-col bg-[#0a0a0c] h-full`}>
                    <div className="h-8 bg-black border-b border-white/10 flex items-center px-4 justify-between">
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Live Artifact Preview</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                        </div>
                    </div>
                    <div className="flex-grow p-4 md:p-8 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(62,185,145,0.05)_0%,transparent_70%)]">
                        <LivePreviewFrame code={activeCode} lastCompiled={lastCompiled} />
                    </div>
                </div>

            </div>

            {/* Mobile Navigation Footer */}
            <div className="md:hidden">
                <MobileNav
                    activeTab={mobileTab}
                    onTabChange={setMobileTab}
                    hasPreview={Boolean(activeCode)}
                />
            </div>
        </div>
    );
};

export default MicroAppForgeView;
