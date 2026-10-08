
/**
 * @file components/shared/MarkdownRenderer.tsx
 * @description A custom, lightweight Markdown renderer designed for the Verdigris Interface Protocol.
 * It handles code blocks (with a glass-terminal aesthetic), headers, lists, and inline formatting.
 * This avoids heavy external dependencies while providing tailored styling.
 */

import React, { useMemo } from 'react';

interface MarkdownRendererProps {
    content: string;
}

/**
 * Renders a single code block with a "Glass Terminal" aesthetic.
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="my-4 rounded-lg overflow-hidden border border-white/10 bg-black/40 shadow-inner group">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-xs font-mono text-text-tertiary uppercase">{language || 'TEXT'}</span>
                </div>
                <button 
                    onClick={handleCopy}
                    className="text-xs text-text-tertiary hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                    COPY
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-sm text-text-secondary leading-relaxed">
                    <code>{code.trim()}</code>
                </pre>
            </div>
        </div>
    );
};

/**
 * Parses and renders inline formatting (bold, italic, code, link).
 * Uses a regex-based tokenization approach.
 */
const InlineRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Split by inline code first to protect it
    const parts = text.split(/(`[^`]+`)/g);

    return (
        <>
            {parts.map((part, i) => {
                // Inline Code
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <span key={i} className="font-mono text-xs bg-white/10 text-roman-aqua px-1.5 py-0.5 rounded border border-white/5 mx-0.5">
                            {part.slice(1, -1)}
                        </span>
                    );
                }

                // Parse Links: [text](url)
                const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
                return linkParts.map((subPart, j) => {
                    const linkMatch = subPart.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) {
                        return (
                            <a 
                                key={`${i}-${j}`} 
                                href={linkMatch[2]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-patina-green hover:underline decoration-patina-green/50 underline-offset-2 transition-all"
                            >
                                {linkMatch[1]}
                            </a>
                        );
                    }

                    // Parse Bold: **text**
                    const boldParts = subPart.split(/(\*\*[^*]+\*\*)/g);
                    return boldParts.map((boldPart, k) => {
                        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                            return <strong key={`${i}-${j}-${k}`} className="text-white font-bold">{boldPart.slice(2, -2)}</strong>;
                        }
                        
                        // Parse Italic: *text*
                        const italicParts = boldPart.split(/(\*[^*]+\*)/g);
                        return italicParts.map((italicPart, l) => {
                            if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
                                return <em key={`${i}-${j}-${k}-${l}`} className="text-text-secondary italic">{italicPart.slice(1, -1)}</em>;
                            }
                            return <span key={`${i}-${j}-${k}-${l}`}>{italicPart}</span>;
                        });
                    });
                });
            })}
        </>
    );
};

/**
 * Main Markdown Renderer Component.
 * Parses block-level elements (Code Blocks, Headers, Lists, Paragraphs).
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // 1. Split by Code Blocks
    // Regex captures the language and the code content.
    // Tries to match ```lang ... ``` non-greedily.
    const blocks = useMemo(() => {
        const regex = /```(\w*)\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(content)) !== null) {
            // Push preceding text
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
            }
            // Push code block
            parts.push({ type: 'code', language: match[1], content: match[2] });
            lastIndex = regex.lastIndex;
        }
        // Push remaining text
        if (lastIndex < content.length) {
            parts.push({ type: 'text', content: content.slice(lastIndex) });
        }
        return parts;
    }, [content]);

    return (
        <div className="space-y-4 text-base leading-relaxed text-text-primary">
            {blocks.map((block, index) => {
                if (block.type === 'code') {
                    return <CodeBlock key={index} language={block.language || ''} code={block.content || ''} />;
                }

                // Process Text Block (Headers, Lists, Paragraphs)
                // Split by double newlines for paragraphs/blocks
                const lines = block.content?.split('\n') || [];
                const renderedElements: React.ReactNode[] = [];
                
                let inList = false;
                let listItems: React.ReactNode[] = [];

                lines.forEach((line, lineIndex) => {
                    const trimmed = line.trim();
                    if (!trimmed) {
                        if (inList) {
                            renderedElements.push(<ul key={`list-${index}-${lineIndex}`} className="list-disc pl-5 space-y-1 mb-4 marker:text-text-tertiary">{listItems}</ul>);
                            listItems = [];
                            inList = false;
                        }
                        return; // Skip empty lines between paragraphs
                    }

                    // Headers
                    if (trimmed.startsWith('#')) {
                        if (inList) {
                            renderedElements.push(<ul key={`list-${index}-${lineIndex}`} className="list-disc pl-5 space-y-1 mb-4 marker:text-text-tertiary">{listItems}</ul>);
                            listItems = [];
                            inList = false;
                        }
                        const level = trimmed.match(/^#+/)?.[0].length || 1;
                        const text = trimmed.slice(level).trim();
                        const HeaderTag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
                        const styles = level === 1 ? 'text-2xl font-bold text-white mt-6 mb-3 font-comfortaa' : level === 2 ? 'text-xl font-bold text-white/90 mt-5 mb-2 font-comfortaa' : 'text-lg font-bold text-white/80 mt-4 mb-2 font-comfortaa';
                        
                        renderedElements.push(<HeaderTag key={`header-${index}-${lineIndex}`} className={styles}><InlineRenderer text={text} /></HeaderTag>);
                        return;
                    }

                    // List Items
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        inList = true;
                        listItems.push(
                            <li key={`li-${index}-${lineIndex}`} className="pl-1 text-text-secondary">
                                <InlineRenderer text={trimmed.slice(2)} />
                            </li>
                        );
                        return;
                    } else if (trimmed.match(/^\d+\.\s/)) {
                         // Ordered list logic typically similar, treating as bullet for simplicity in this minimal renderer
                         inList = true;
                         listItems.push(
                            <li key={`li-${index}-${lineIndex}`} className="pl-1 text-text-secondary">
                                <InlineRenderer text={trimmed.replace(/^\d+\.\s/, '')} />
                            </li>
                        );
                        return;
                    }

                    // Close list if we encounter non-list text
                    if (inList) {
                        renderedElements.push(<ul key={`list-${index}-${lineIndex}`} className="list-disc pl-5 space-y-1 mb-4 marker:text-text-tertiary">{listItems}</ul>);
                        listItems = [];
                        inList = false;
                    }

                    // Paragraphs
                    renderedElements.push(
                        <p key={`p-${index}-${lineIndex}`} className="mb-2 last:mb-0">
                            <InlineRenderer text={line} />
                        </p>
                    );
                });

                // Flush remaining list
                if (inList) {
                    renderedElements.push(<ul key={`list-end-${index}`} className="list-disc pl-5 space-y-1 mb-4 marker:text-text-tertiary">{listItems}</ul>);
                }

                return <React.Fragment key={index}>{renderedElements}</React.Fragment>;
            })}
        </div>
    );
};

export default MarkdownRenderer;
