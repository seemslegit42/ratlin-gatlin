
/**
 * @file components/forge/CodeEditor.tsx
 * @description A lightweight, stylized code editor for Vibe Coding.
 * Simulates a high-fidelity terminal environment.
 */

import React from 'react';

interface CodeEditorProps {
    code: string;
    onChange: (val: string) => void;
    isReadOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, isReadOnly }) => {
    return (
        <div className="w-full h-full relative group">
            <textarea
                value={code}
                onChange={(e) => onChange(e.target.value)}
                readOnly={isReadOnly}
                spellCheck={false}
                className="w-full h-full bg-[#0D0D12] text-white font-mono text-sm p-6 resize-none focus:outline-none leading-relaxed custom-scrollbar selection:bg-imperial-purple/50"
                style={{
                    fontFamily: '"Martian Mono", monospace',
                    lineHeight: '1.6',
                }}
            />
            {/* Visual Flair: Glow Reflection */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-imperial-purple/5 to-transparent pointer-events-none" />
            
            {isReadOnly && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <span className="text-roman-aqua font-bold font-mono animate-pulse">
                        <span className="mr-2">⚡</span> 
                        NEURAL INJECTION IN PROGRESS...
                    </span>
                </div>
            )}
        </div>
    );
};
