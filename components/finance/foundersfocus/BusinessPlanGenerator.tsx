
/**
 * @file components/finance/foundersfocus/BusinessPlanGenerator.tsx
 * @description The Autonomous Business Plan Generator.
 * Features a bi-directional link between financial drivers and narrative text using RAG principles.
 * Includes "Text-to-Model" simulation where strategy updates financial drivers.
 */

import React, { useState } from 'react';
import { ModuleCard } from '../../../modules/shared/ModuleCard';
import { motion, AnimatePresence } from 'framer-motion';

const STRATEGIES: Record<string, { title: string; alignment: string; color: string; highlight: string }> = {
    'Alberta': {
        title: 'Edmonton Unlimited 2025',
        alignment: 'Detected alignment with Edmonton Unlimited 2025 Strategic Plan.',
        color: 'text-imperial-purple',
        highlight: 'Clean Tech'
    },
    'BC': {
        title: 'Innovate BC Digital Framework',
        alignment: 'Detected alignment with Pacific Economic Development Canada (PacifiCan) priorities.',
        color: 'text-emerald-400',
        highlight: 'Ocean Tech / AI'
    },
    'Svalbard': {
        title: 'Arctic World Archive Protocol',
        alignment: 'Detected alignment with Longyearbyen Community Council Data Preservation Standards.',
        color: 'text-cyan-300',
        highlight: 'Cold Storage / Resilience'
    }
};

export const BusinessPlanGenerator: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState('executive');
    const [region, setRegion] = useState('Alberta');
    const [strategicInput, setStrategicInput] = useState('');
    const [detectedUpdate, setDetectedUpdate] = useState<{ driver: string, change: string } | null>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000);
    };

    const handleStrategicInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setStrategicInput(val);
        
        // Simulating Agentic parsing of intent (Text-to-Model Logic)
        if (val.toLowerCase().includes("hire") && val.toLowerCase().includes("sales")) {
            setDetectedUpdate({ driver: "Payroll (S&M)", change: "+$12,000/mo" });
        } else if (val.toLowerCase().includes("server") || val.toLowerCase().includes("cloud")) {
            setDetectedUpdate({ driver: "COGS (Hosting)", change: "+15% Scaling" });
        } else {
            setDetectedUpdate(null);
        }
    };

    const strategy = STRATEGIES[region];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-fade-in">
            {/* Input Console */}
            <ModuleCard title="Context-Aware Generation" className="lg:col-span-1">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Target Jurisdiction</label>
                        <select 
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-white/30 outline-none"
                        >
                            <option value="Alberta">Alberta (Edmonton)</option>
                            <option value="BC">British Columbia (Vancouver)</option>
                            <option value="Svalbard">Svalbard (Longyearbyen)</option>
                        </select>
                    </div>
                    
                    {/* Text-to-Model Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-text-secondary uppercase">Strategic Intent (Text-to-Model)</label>
                            <span className="text-[9px] text-roman-aqua font-mono animate-pulse">AI LISTENING</span>
                        </div>
                        <textarea 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white h-24 focus:border-roman-aqua outline-none resize-none transition-colors" 
                            placeholder="e.g., 'We plan to hire 2 sales reps in Q3 to boost acquisition.'"
                            value={strategicInput}
                            onChange={handleStrategicInput}
                        />
                        
                        <AnimatePresence>
                            {detectedUpdate && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 p-2 bg-roman-aqua/10 border border-roman-aqua/30 rounded flex items-center space-x-2"
                                >
                                    <div className="w-2 h-2 bg-roman-aqua rounded-full animate-ping" />
                                    <div className="text-xs text-roman-aqua">
                                        <span className="font-bold">Model Update:</span> {detectedUpdate.driver} <span className="opacity-70">({detectedUpdate.change})</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Target Market</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white">
                            <option>Early-Stage Founders (Pre-Seed)</option>
                            <option>Series A Enterprise</option>
                            <option>Government / Public Sector</option>
                        </select>
                    </div>
                    
                    <motion.div 
                        key={region}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 bg-white/5 border border-white/10 rounded-lg`}
                    >
                        <div className={`flex items-center space-x-2 ${strategy.color} mb-2`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                            <span className="text-xs font-bold uppercase">Strategic Alignment</span>
                        </div>
                        <p className="text-[10px] text-text-tertiary">
                            {strategy.alignment} 
                            <br/>
                            Recommendation: Emphasize <span className="text-white font-bold">"{strategy.highlight}"</span> data reporting capabilities.
                        </p>
                    </motion.div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-imperial-purple to-pink-600 rounded-lg text-white font-bold text-sm shadow-lg hover:shadow-pink-500/20 transition-all flex items-center justify-center space-x-2"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Synthesizing Narrative...</span>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                <span>Generate Business Plan</span>
                            </>
                        )}
                    </button>
                </div>
            </ModuleCard>

            {/* Document Preview */}
            <div className="lg:col-span-2 bg-white text-black rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
                {/* Toolbar */}
                <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex space-x-4 text-xs font-bold text-gray-500">
                        <button onClick={() => setActiveSection('executive')} className={activeSection === 'executive' ? 'text-black underline' : ''}>Executive Summary</button>
                        <button onClick={() => setActiveSection('market')} className={activeSection === 'market' ? 'text-black underline' : ''}>Market Analysis</button>
                        <button onClick={() => setActiveSection('deck')} className={activeSection === 'deck' ? 'text-purple-600 underline' : ''}>Pitch Deck View</button>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">v1.2.4 (Auto-Save)</div>
                </div>

                {/* Content */}
                <div className="p-8 flex-grow overflow-y-auto font-serif leading-relaxed relative">
                    {isGenerating && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-imperial-purple border-t-transparent rounded-full animate-spin mb-4" />
                                <span className="text-imperial-purple font-bold font-sans text-sm animate-pulse">Consulting "FinRobot" Framework...</span>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'deck' ? (
                        <div className="aspect-video bg-black rounded-lg text-white p-8 flex flex-col justify-center items-center relative overflow-hidden border border-gray-800">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
                            <h2 className="text-4xl font-bold font-sans relative z-10 mb-4">FoundersFocus</h2>
                            <p className="text-xl text-gray-300 font-light relative z-10">Democratizing Financial Intelligence</p>
                            <div className="mt-8 grid grid-cols-3 gap-8 w-full max-w-2xl relative z-10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-400">$2.4B</div>
                                    <div className="text-xs uppercase tracking-widest mt-1">TAM ({region})</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-400">85%</div>
                                    <div className="text-xs uppercase tracking-widest mt-1">Gross Margin</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-400">14mo</div>
                                    <div className="text-xs uppercase tracking-widest mt-1">Runway</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold mb-6 text-gray-900">1. Executive Summary</h1>
                            <p className="mb-4 text-gray-700">
                                The global financial technology landscape has witnessed a proliferation of tools designed to streamline corporate finance, yet a profound structural gap remains for early-stage, solo founders—particularly within the unique regulatory and economic ecosystem of <span className="bg-yellow-100 px-1 font-bold">{region}</span>.
                            </p>
                            <p className="mb-4 text-gray-700">
                                <span className="font-bold">FoundersFocus</span> fills this gap by treating grant milestones as core financial drivers, integrating them directly into the cash flow logic. Furthermore, legacy tools like Jedox or Planful require significant setup time and financial acumen to configure "drivers," often necessitating external consultants.
                            </p>
                            <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">1.1 The Market Failure</h2>
                            <p className="mb-4 text-gray-700">
                                To understand the necessity of FoundersFocus, one must analyze the shortcomings of the incumbent software stack through the lens of a pre-seed {region} founder. The market is currently bifurcated into simplified expense trackers and overly complex enterprise planning systems.
                            </p>
                            
                            {strategicInput && (
                                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                                    <h3 className="font-bold text-blue-700 text-sm mb-1 uppercase font-sans">Strategic Update (Q3)</h3>
                                    <p className="text-blue-900 text-sm">{strategicInput}</p>
                                    <p className="text-xs text-blue-500 mt-2 font-mono">Synced with Financial Model v2.1</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
