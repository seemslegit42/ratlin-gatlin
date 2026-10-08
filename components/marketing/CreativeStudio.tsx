
/**
 * @file components/marketing/CreativeStudio.tsx
 * @description A generative workspace for creating and optimizing ad assets using AI.
 * Includes simulated text generation and asset management.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { ZapIcon } from '../icons/VitalsIcons';
import { LayersIcon } from '../icons/LayersIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface Creative {
    id: string;
    title: string;
    type: 'Image' | 'Copy';
    score: number;
    status: 'Draft' | 'Generating' | 'Ready';
    previewColor: string;
    content?: string;
}

export const CreativeStudio: React.FC = () => {
    const [creatives, setCreatives] = useState<Creative[]>([
        { id: '1', title: 'Cyberpunk Product Shot', type: 'Image', score: 92, status: 'Ready', previewColor: 'bg-purple-500' },
        { id: '2', title: 'Value Prop Headline A', type: 'Copy', score: 85, status: 'Ready', previewColor: 'bg-blue-500', content: "Unlock the future of work. Automate the impossible." },
        { id: '3', title: 'Dark Mode UI Teaser', type: 'Image', score: 78, status: 'Ready', previewColor: 'bg-gray-800' },
    ]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [generationType, setGenerationType] = useState<'Image' | 'Copy'>('Copy');
    const [generatedOutput, setGeneratedOutput] = useState('');

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setGeneratedOutput('');

        // Simulate typing effect for text or loading for image
        if (generationType === 'Copy') {
            const targetText = `Generated Concept: "${prompt}"\n\n1. "Experience seamless automation."\n2. "Your workflow, evolved."\n3. "The future is agentic."`;
            let i = 0;
            const interval = setInterval(() => {
                setGeneratedOutput(targetText.slice(0, i));
                i++;
                if (i > targetText.length) {
                    clearInterval(interval);
                    finalizeGeneration();
                }
            }, 30);
        } else {
            // Image simulation
            setTimeout(() => {
                finalizeGeneration();
            }, 2000);
        }
    };

    const finalizeGeneration = () => {
        const newId = Date.now().toString();
        const newCreative: Creative = {
            id: newId,
            title: generationType === 'Copy' ? 'New Ad Copy' : 'New Visual Asset',
            type: generationType,
            score: Math.floor(Math.random() * 15 + 80),
            status: 'Ready',
            previewColor: generationType === 'Copy' ? 'bg-indigo-600' : 'bg-pink-500',
            content: generatedOutput
        };
        
        setCreatives(prev => [newCreative, ...prev]);
        setIsGenerating(false);
        setPrompt('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Control Panel */}
            <ModuleCard title="Generator Controls" className="col-span-1">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Asset Type</label>
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button 
                                onClick={() => setGenerationType('Image')}
                                className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${generationType === 'Image' ? 'bg-white/10 text-white shadow-sm' : 'text-text-tertiary hover:text-white'}`}
                            >
                                Visual
                            </button>
                            <button 
                                onClick={() => setGenerationType('Copy')}
                                className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${generationType === 'Copy' ? 'bg-white/10 text-white shadow-sm' : 'text-text-tertiary hover:text-white'}`}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Prompt Input</label>
                        <textarea 
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:border-roman-aqua outline-none transition-colors placeholder-white/20"
                            placeholder={generationType === 'Image' ? "Describe the visual style..." : "Describe the key message and tone..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    
                    {/* Live Preview Area for Text */}
                    {generationType === 'Copy' && (generatedOutput || isGenerating) && (
                        <div className="p-3 bg-black/60 rounded-lg border border-white/5 font-mono text-xs text-patina-green min-h-[60px] whitespace-pre-wrap">
                            {generatedOutput}
                            {isGenerating && <span className="animate-pulse">_</span>}
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full py-3 bg-gradient-to-r from-roman-aqua to-patina-green rounded-lg text-black font-bold text-sm shadow-lg hover:shadow-patina-green/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ZapIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>{isGenerating ? 'Synthesizing...' : 'Generate Asset'}</span>
                    </button>
                </div>
            </ModuleCard>

            {/* Asset Grid */}
            <ModuleCard title="Asset Library" className="col-span-1 lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {creatives.map((c) => (
                            <motion.div
                                key={c.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                            >
                                {/* Preview */}
                                <div className={`absolute inset-0 ${c.previewColor} opacity-50 group-hover:opacity-70 transition-opacity flex items-center justify-center flex-col p-4 text-center`}>
                                    {c.status === 'Generating' ? (
                                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : c.type === 'Copy' ? (
                                        <div className="text-[10px] text-white font-serif italic line-clamp-4">
                                            "{c.content || 'Lorem ipsum dolor sit amet...'}"
                                        </div>
                                    ) : (
                                        <LayersIcon className="w-12 h-12 text-white/20" />
                                    )}
                                </div>
                                
                                {/* Overlay Info */}
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="text-xs font-bold text-white truncate">{c.title}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-text-tertiary uppercase">{c.type}</span>
                                        {c.status === 'Ready' && (
                                            <span className={`text-[10px] font-mono font-bold ${c.score > 90 ? 'text-patina-green' : 'text-yellow-400'}`}>
                                                {c.score} AI Score
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-roman-aqua hover:text-black">
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ModuleCard>
        </div>
    );
};
