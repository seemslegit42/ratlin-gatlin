
/**
 * @file components/weaver/CodeExecutionTerminal.tsx
 * @description A specialized visual component for Code Execution and WASM agents.
 * Renders a terminal-like interface with syntax highlighting aesthetics and console output.
 */

import React from 'react';
import type { Agent } from '../../types';
import { AgentType } from '../../types';

export const CodeExecutionTerminal: React.FC<{ agent: Agent }> = ({ agent }) => {
    const output = agent.outputData;
    const isWasm = agent.type === AgentType.WasmExecutor;
    
    const code = isWasm 
        ? (agent.data.wasmBinary ? `[WASM BINARY LOADED]\nSize: ${(agent.data.wasmBinary as string | any[]).length} bytes\nEntry: ${agent.data.entryFunction || 'run'}` : '// No WASM binary loaded')
        : ((agent.data.code as string) || '// Enter code in Inspector...');
        
    const lang = isWasm ? 'WASM' : ((agent.data.language as string) || 'JAVASCRIPT');

    return (
        <div className="flex flex-col h-full w-full min-w-[280px] bg-[#1e1e1e] rounded-lg overflow-hidden border border-white/10 font-mono text-xs shadow-inner transition-all hover:border-white/20">
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-2 bg-white/5 border-b border-white/5">
                <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                </div>
                <div className="flex items-center space-x-2">
                     <span className="text-[9px] text-text-tertiary uppercase tracking-wider font-bold">{lang}</span>
                </div>
            </div>
            
            {/* Code Preview */}
            <div className="flex-grow p-3 bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden relative group">
                 <div className="absolute inset-0 p-3 overflow-auto custom-scrollbar">
                    <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed opacity-80 font-medium">
                        {code}
                    </pre>
                 </div>
            </div>

            {/* Console Output */}
            <div className="border-t border-white/10 bg-black/40 p-2 min-h-[40px] flex flex-col justify-center">
                <div className="flex items-start space-x-2">
                    <span className="text-patina-green shrink-0 mt-0.5">➜</span>
                    <div className="text-patina-green break-all line-clamp-2 font-mono text-[10px]">
                         {output ? (typeof output === 'object' ? JSON.stringify(output) : String(output)) : <span className="animate-pulse text-text-tertiary">_</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
