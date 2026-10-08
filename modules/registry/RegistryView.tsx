/**
 * @file modules/registry/RegistryView.tsx
 * @description The "Monolith Registry" explorer. Implements Bun-inspired Workspace management.
 * Provides a specialized interface for managing Syndicate "Packages" (Micro-apps, Libraries, Protocols)
 * using monorepo patterns like Hoisting and Catalogs.
 * Includes version history, dependency graph, and workspace telemetry.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/shared/BackButton.js';
import { ModuleCard } from '../shared/ModuleCard.js';
import { FolderIcon, ZapIcon } from '../../components/icons/QuickActionIcons.js';
import { TrendingUpIcon } from '../../components/icons/VitalsIcons.js';
import { LayersIcon } from '../../components/icons/LayersIcon.js';
import { DatabaseIcon, ClockIcon } from '../../components/icons/AetheriumIcons.js';
import { FilterIcon } from '../../components/icons/FilterIcon.js';
import type { View, WorkspacePackage } from '../../types.js';

interface RegistryViewProps {
    onNavigate: (view: View) => void;
}

const MOCK_PACKAGES: WorkspacePackage[] = [
    {
        id: 'pkg-core-auth',
        name: '@syndicate/auth-protocol',
        version: '1.2.4',
        description: 'Hardened biometric neural handshake library with multi-factor challenge flow and session revocation.',
        path: 'packages/auth-protocol',
        dependencies: { '@syndicate/vault-bridge': 'workspace:*', 'jose': 'catalog:default', 'zod': 'catalog:default' },
        scripts: { 'audit': 'aegis --scan', 'bench': 'cogniops bench', 'test': 'bun test' },
        type: 'library',
        status: 'published'
    },
    {
        id: 'pkg-energy-ui',
        name: '@syndicate/mycelium-ui',
        version: '0.9.1',
        description: 'Reactive dashboard components for BESS optimization and real-time grid telemetry visualization.',
        path: 'packages/mycelium-ui',
        dependencies: { 'framer-motion': 'catalog:ui', '@syndicate/theme': 'workspace:*', 'three': 'catalog:ui' },
        scripts: { 'forge': 'anvil compile', 'preview': 'artifact run', 'typecheck': 'tsc --noEmit' },
        type: 'micro-app',
        status: 'linked'
    },
    {
        id: 'pkg-legal-guard',
        name: '@syndicate/brand-sentinel',
        version: '2.0.0',
        description: 'Agentic compliance and narrative coherence monitor with real-time brand safety scoring.',
        path: 'packages/brand-sentinel',
        dependencies: { 'ollama': 'catalog:ai', '@syndicate/auth-protocol': 'workspace:*' },
        scripts: { 'watch': 'beep monitor', 'report': 'scribe generate', 'test': 'bun test --coverage' },
        type: 'protocol',
        status: 'published'
    },
    {
        id: 'pkg-xi-engine',
        name: '@syndicate/xi-economy',
        version: '3.1.0',
        description: 'Reward tokenomics engine. Implements SRE formula, Klepsydra flow scoring, and chaos card dispatch.',
        path: 'packages/xi-economy',
        dependencies: { 'nanoid': 'catalog:default', '@syndicate/vault-bridge': 'workspace:*' },
        scripts: { 'validate': 'xi-lint', 'simulate': 'bun run scripts/simulate-economy.ts', 'test': 'bun test' },
        type: 'library',
        status: 'published'
    },
    {
        id: 'pkg-vault-bridge',
        name: '@syndicate/vault-bridge',
        version: '1.0.3',
        description: 'Unified data access layer via Appwrite TablesDB, Storage, Realtime, and in-memory KV caches.',
        path: 'packages/vault-bridge',
        dependencies: { 'appwrite': 'catalog:default' },
        scripts: { 'migrate': 'vault-cli migrate', 'seed': 'vault-cli seed', 'test': 'bun test --timeout=10000' },
        type: 'library',
        status: 'linked'
    },
    {
        id: 'pkg-theme',
        name: '@syndicate/theme',
        version: '1.1.0',
        description: 'Centralized design token system. Obsidian-black, imperial-purple, roman-aqua, and patina-green palettes.',
        path: 'packages/theme',
        dependencies: {},
        scripts: { 'generate': 'tokens-gen --config tokens.config.ts', 'preview': 'storybook dev' },
        type: 'library',
        status: 'published'
    },
];

const GLOBAL_CATALOG = {
    'default': { 'jose': '^4.0.0', 'zod': '^3.22.0', 'nanoid': '^5.0.9', 'appwrite': '^16.0.2' },
    'ui': { 'framer-motion': '^12.2.0', 'three': '^0.170.0', 'react-draggable': '^4.4.6' },
    'ai': { 'ollama': 'local', '@mediapipe/tasks-genai': '^0.10.14' }
};

const VERSION_HISTORY: { id: string; pkg: string; version: string; author: string; message: string; timestamp: number; type: 'major' | 'minor' | 'patch' }[] = [
    { id: 'v1', pkg: '@syndicate/xi-economy', version: '3.1.0', author: 'Sovereign Axiom', message: 'feat: add second-wind bonus mechanics to Klepsydra SRE formula', timestamp: Date.now() - 3600000, type: 'minor' },
    { id: 'v2', pkg: '@syndicate/brand-sentinel', version: '2.0.0', author: 'Nebula Collective', message: 'feat!: rewrite compliance scorer with LLM-based narrative analysis', timestamp: Date.now() - 86400000, type: 'major' },
    { id: 'v3', pkg: '@syndicate/auth-protocol', version: '1.2.4', author: 'Void Systems', message: 'fix: resolve session token rotation edge case on re-auth', timestamp: Date.now() - 172800000, type: 'patch' },
    { id: 'v4', pkg: '@syndicate/vault-bridge', version: '1.0.3', author: 'Quantum Labs', message: 'fix: handle Appwrite TablesDB timeout on cold-start', timestamp: Date.now() - 259200000, type: 'patch' },
    { id: 'v5', pkg: '@syndicate/mycelium-ui', version: '0.9.1', author: 'Aether Protocol', message: 'feat: add BESS grid volatility overlay to Mycelium dashboard', timestamp: Date.now() - 345600000, type: 'minor' },
];

const DependencyGraph: React.FC<{ packages: WorkspacePackage[] }> = ({ packages }) => {
    return (
        <div className="h-64 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(32,178,170,0.05)_0%,transparent_70%)]" />

            <svg className="absolute inset-0 w-full h-full opacity-40">
                {packages.slice(0, 5).map((pkg, i) => (
                    <motion.g key={pkg.id}>
                        <motion.circle
                            cx={`${15 + (i * 18)}%`}
                            cy="50%"
                            r="5"
                            fill="var(--patina-green)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        />
                        {i < packages.slice(0, 5).length - 1 && (
                            <motion.line
                                x1={`${15 + (i * 18)}%`} y1="50%"
                                x2={`${15 + ((i + 1) * 18)}%`} y2="50%"
                                stroke="white" strokeWidth="1" strokeDasharray="4 4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                            />
                        )}
                    </motion.g>
                ))}
            </svg>

            <div className="relative z-10 flex gap-8 flex-wrap justify-center px-4">
                {packages.slice(0, 5).map((pkg, i) => (
                    <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-roman-aqua shadow-xl group-hover:scale-110 transition-transform">
                            <LayersIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-mono text-text-secondary uppercase">{pkg.name.split('/')[1]}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const VERSION_TYPE_COLORS: Record<string, string> = {
    major: 'bg-red-500/20 text-red-400 border-red-500/30',
    minor: 'bg-roman-aqua/20 text-roman-aqua border-roman-aqua/30',
    patch: 'bg-patina-green/20 text-patina-green border-patina-green/30',
};

export const RegistryView: React.FC<RegistryViewProps> = ({ onNavigate }) => {
    const [selectedPackage, setSelectedPackage] = useState<WorkspacePackage | null>(MOCK_PACKAGES[0]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executingScript, setExecutingScript] = useState<string | null>(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'packages' | 'history' | 'catalogs' | 'telemetry'>('packages');

    const handleRunScript = (name: string) => {
        setExecutingScript(name);
        setIsExecuting(true);
        setTimeout(() => {
            setIsExecuting(false);
            setExecutingScript(null);
        }, 2000);
    };

    const filteredPackages = MOCK_PACKAGES.filter(p =>
        filterQuery === '' ||
        p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black/80 relative font-lexend high-density">
            <div className="flex items-center justify-between">
                <BackButton onClick={() => onNavigate('main')} label="Cockpit" />
                <div className="flex items-center gap-4 px-4 py-2 bg-black/60 rounded-2xl border border-white/10 shadow-2xl">
                    <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">Syndicate Monorepo Root</span>
                    <span className="text-[10px] font-mono font-bold text-patina-green">~/levon-os</span>
                </div>
            </div>

            <header className="border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold font-comfortaa text-white tracking-tighter">The Registry</h1>
                    <p className="text-sm text-text-tertiary font-mono tracking-[0.3em] uppercase mt-1">
                        Bun-Powered Workspaces // Neural Hoisting // {MOCK_PACKAGES.length} Packages
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 rounded-xl text-xs font-bold uppercase transition-all">
                        bun install
                    </button>
                    <button className="px-4 py-2 bg-patina-green text-black border border-patina-green rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-patina-green/20">
                        Add Package
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-black/30 p-1 rounded-xl border border-white/10 w-fit">
                {([
                    { id: 'packages', label: 'Packages' },
                    { id: 'history', label: 'Version History' },
                    { id: 'catalogs', label: 'Catalogs' },
                    { id: 'telemetry', label: 'Telemetry' },
                ] as { id: typeof activeTab; label: string }[]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab.id ? 'bg-white/10 text-white border border-white/20' : 'text-text-tertiary hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ==================== PACKAGES ==================== */}
                {activeTab === 'packages' && (
                    <motion.div key="packages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left: Package List */}
                            <div className="lg:col-span-4 flex flex-col gap-4">
                                <div className="relative">
                                    <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                                    <input
                                        type="text"
                                        placeholder="Filter packages..."
                                        value={filterQuery}
                                        onChange={(e) => setFilterQuery(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-text-tertiary focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                                <ModuleCard title={`Active Workspaces (${filteredPackages.length})`}>
                                    <div className="space-y-2">
                                        {filteredPackages.map(pkg => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => setSelectedPackage(pkg)}
                                                className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center group ${
                                                    selectedPackage?.id === pkg.id
                                                        ? 'bg-roman-aqua/10 border-roman-aqua'
                                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-black/40 ${selectedPackage?.id === pkg.id ? 'text-roman-aqua' : 'text-text-tertiary group-hover:text-white'}`}>
                                                        <FolderIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white group-hover:text-roman-aqua transition-colors truncate max-w-[140px]">{pkg.name}</div>
                                                        <div className="text-[9px] text-text-tertiary font-mono">v{pkg.version} • {pkg.type}</div>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${pkg.status === 'published' ? 'text-patina-green border-patina-green/30 bg-patina-green/10' : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'}`}>
                                                    {pkg.status}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </ModuleCard>
                            </div>

                            {/* Right: Package Detail */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <AnimatePresence mode="wait">
                                    {selectedPackage ? (
                                        <motion.div
                                            key={selectedPackage.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex flex-col gap-6"
                                        >
                                            <div className="bg-panel-bg border border-glass-border rounded-2xl p-8 flex flex-col shadow-glass relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                    <LayersIcon className="w-48 h-48 text-white" />
                                                </div>

                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div>
                                                        <h2 className="text-2xl font-bold font-comfortaa text-white mb-1">{selectedPackage.name}</h2>
                                                        <p className="text-sm text-text-secondary max-w-md">{selectedPackage.description}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-end">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                            selectedPackage.status === 'linked' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-patina-green/10 border-patina-green/30 text-patina-green'
                                                        }`}>
                                                            {selectedPackage.status}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-text-tertiary uppercase">
                                                            {selectedPackage.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3 border-b border-white/5 pb-2 flex justify-between">
                                                            <span>Protocols (Dependencies)</span>
                                                            <span className="text-patina-green">Hoisted</span>
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {Object.entries(selectedPackage.dependencies).map(([name, ver]) => (
                                                                <div key={name} className="flex justify-between items-center p-2 bg-black/40 rounded border border-white/5 hover:border-white/20 transition-all group">
                                                                    <span className="text-xs text-white/80 group-hover:text-roman-aqua truncate">{name}</span>
                                                                    <span className={`text-[10px] font-mono flex-shrink-0 ml-2 ${(ver as string).includes('workspace') ? 'text-patina-green' : 'text-roman-aqua'}`}>
                                                                        {ver as string}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {Object.keys(selectedPackage.dependencies).length === 0 && (
                                                                <p className="text-xs text-text-tertiary italic">No external dependencies.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Swarm Scripts</h4>
                                                        <div className="space-y-2">
                                                            {Object.entries(selectedPackage.scripts).map(([name, cmd]) => (
                                                                <button
                                                                    key={name}
                                                                    onClick={() => handleRunScript(name)}
                                                                    className="w-full flex justify-between items-center p-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all group"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <ZapIcon className="w-3 h-3 text-patina-green opacity-0 group-hover:opacity-100" />
                                                                        <span className="text-xs text-white group-hover:text-patina-green">{name}</span>
                                                                    </div>
                                                                    <code className="text-[9px] text-text-tertiary font-mono group-hover:text-white">{cmd}</code>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Terminal */}
                                                <div className="mt-2 bg-black rounded-xl p-4 font-mono text-[10px] border border-white/10 h-32 relative overflow-hidden flex flex-col shadow-inner">
                                                    <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-patina-green font-bold">$ bun run</span>
                                                            <div className="relative">
                                                                <FilterIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-tertiary" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="--filter..."
                                                                    value={filterQuery}
                                                                    onChange={(e) => setFilterQuery(e.target.value)}
                                                                    className="bg-white/5 border border-white/10 rounded px-7 py-1 text-[9px] text-white focus:outline-none focus:border-patina-green w-32"
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-[8px] text-text-tertiary uppercase tracking-widest">Active Runtime: Bun v1.3.11</span>
                                                    </div>

                                                    <div className="flex-grow text-white opacity-80 overflow-y-auto custom-scrollbar">
                                                        {isExecuting ? (
                                                            <div className="animate-pulse space-y-1">
                                                                <span className="text-patina-green">[OK]</span> Initializing monorepo context...<br />
                                                                <span className="text-roman-aqua">[HOIST]</span> Shared dependencies resolved to root...<br />
                                                                <span className="text-yellow-400">[RUN]</span> Executing: bun run {executingScript} --filter "{selectedPackage.name}"<br />
                                                                <span className="text-white opacity-40">| ▒▒▒▒▒▒▒▒▒▒▒▒ 62%</span>
                                                            </div>
                                                        ) : (
                                                            <div className="opacity-40 italic">Waiting for Sovereign signal to execute parallel scripts.</div>
                                                        )}
                                                    </div>
                                                    {isExecuting && (
                                                        <div className="absolute bottom-4 right-4 text-roman-aqua animate-pulse uppercase font-black tracking-tighter text-[10px]">
                                                            Running Swarm...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-text-tertiary opacity-30">
                                            <LayersIcon className="w-16 h-16 mb-4" />
                                            <p className="text-sm">Select a workspace to observe its logical topology.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Bottom: Dep Graph + Efficiency */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ModuleCard title="Registry Topology">
                                <DependencyGraph packages={MOCK_PACKAGES} />
                            </ModuleCard>
                            <ModuleCard title="Workspace Efficiency">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                            <div className="text-[9px] font-black text-roman-aqua uppercase tracking-widest mb-1">Hoisting Ratio</div>
                                            <div className="text-2xl font-mono font-bold text-white">4.2 : 1</div>
                                            <p className="text-[8px] text-text-tertiary mt-1">Deduplicated 2.4k neural nodes.</p>
                                        </div>
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                            <div className="text-[9px] font-black text-patina-green uppercase tracking-widest mb-1">Install Speed</div>
                                            <div className="text-2xl font-mono font-bold text-white">124ms</div>
                                            <p className="text-[8px] text-text-tertiary mt-1">Cached in persistent aether.</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-text-tertiary leading-relaxed">
                                        The Registry ensures all workspaces share the same cognitive primitives. This reduces cold-boot latency by <span className="text-patina-green">68%</span> when spawning new micro-apps across the Syndicate.
                                    </p>
                                </div>
                            </ModuleCard>
                        </div>
                    </motion.div>
                )}

                {/* ==================== VERSION HISTORY ==================== */}
                {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        <p className="text-sm text-text-secondary">Chronological changelog across all Syndicate packages. Sorted by most recent commit.</p>
                        <div className="space-y-3">
                            {VERSION_HISTORY.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-black/40 border border-white/5 rounded-xl p-5 flex items-start gap-4 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${VERSION_TYPE_COLORS[entry.type]}`}>
                                            {entry.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-text-tertiary">v{entry.version}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="text-[10px] font-mono text-roman-aqua mb-1">{entry.pkg}</div>
                                                <div className="text-sm font-bold text-white">{entry.message}</div>
                                            </div>
                                            <div className="text-right text-[9px] text-text-tertiary flex-shrink-0">
                                                <div>{entry.author}</div>
                                                <div className="mt-0.5">{new Date(entry.timestamp).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ==================== CATALOGS ==================== */}
                {activeTab === 'catalogs' && (
                    <motion.div key="catalogs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <p className="text-sm text-text-secondary">
                            Shared dependency catalogs enforce version consistency across all workspaces. Updating a catalog version automatically resonates to all linked packages at next install.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(GLOBAL_CATALOG).map(([catName, deps]) => (
                                <ModuleCard key={catName} title={`catalog:${catName}`} icon={<LayersIcon className="w-4 h-4 text-roman-aqua" />}>
                                    <div className="space-y-2">
                                        {Object.entries(deps).map(([name, ver]) => (
                                            <div key={name} className="flex justify-between items-center p-2 bg-black/30 rounded-lg border border-white/5 hover:border-white/20 transition-all group">
                                                <span className="text-xs text-white/80 group-hover:text-roman-aqua">{name}</span>
                                                <span className="text-[10px] font-mono text-patina-green">{ver}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-text-tertiary">
                                        <span>{Object.keys(deps).length} dependencies</span>
                                        <button className="text-roman-aqua hover:text-white transition-colors font-bold uppercase tracking-wider">
                                            Edit Catalog
                                        </button>
                                    </div>
                                </ModuleCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ==================== TELEMETRY ==================== */}
                {activeTab === 'telemetry' && (
                    <motion.div key="telemetry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Packages', value: MOCK_PACKAGES.length.toString(), color: 'text-roman-aqua', sub: `${MOCK_PACKAGES.filter(p => p.status === 'published').length} published` },
                                { label: 'Shared Deps', value: '12', color: 'text-patina-green', sub: 'Hoisted to root' },
                                { label: 'Avg Bundle Size', value: '48 KB', color: 'text-yellow-400', sub: 'Gzipped output' },
                                { label: 'Type Coverage', value: '97%', color: 'text-imperial-purple', sub: 'TypeScript strict' },
                            ].map(({ label, value, color, sub }) => (
                                <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-5">
                                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">{label}</div>
                                    <div className={`text-2xl font-mono font-bold ${color} mb-1`}>{value}</div>
                                    <div className="text-[9px] text-text-tertiary">{sub}</div>
                                </div>
                            ))}
                        </div>

                        <ModuleCard title="Package Health Matrix" icon={<TrendingUpIcon className="w-5 h-5 text-roman-aqua" />}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                                            <th className="text-left py-2 pr-4">Package</th>
                                            <th className="text-left py-2 pr-4">Version</th>
                                            <th className="text-left py-2 pr-4">Type Coverage</th>
                                            <th className="text-left py-2 pr-4">Test Pass</th>
                                            <th className="text-left py-2 pr-4">Bundle Size</th>
                                            <th className="text-left py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {MOCK_PACKAGES.map(pkg => (
                                            <tr key={pkg.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 pr-4 font-mono text-roman-aqua">{pkg.name.split('/')[1]}</td>
                                                <td className="py-3 pr-4 font-mono text-text-tertiary">v{pkg.version}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                            <div className="bg-patina-green h-full" style={{ width: `${85 + Math.random() * 14}%` }} />
                                                        </div>
                                                        <span className="text-patina-green">{(85 + Math.floor(Math.random() * 14))}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className="text-patina-green font-bold">✓ Pass</span>
                                                </td>
                                                <td className="py-3 pr-4 text-text-secondary">{(20 + Math.floor(Math.random() * 60))} KB</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${pkg.status === 'published' ? 'bg-patina-green/10 border-patina-green/30 text-patina-green' : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'}`}>
                                                        {pkg.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ModuleCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RegistryView;
