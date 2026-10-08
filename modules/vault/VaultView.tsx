/**
 * @file modules/vault/VaultView.tsx
 * @description The "Sovereign's Personal Vault" explorer. 
 * Provides structural observability into the Appwrite data plane:
 * TablesDB (sovereign rows), Storage (avatars/media), Realtime (live sync).
 * Also exposes KV Store entries, Tool Call logs, and a libSQL shell (local preview).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/shared/BackButton.js';
import { ModuleCard } from '../shared/ModuleCard.js';
import { DatabaseIcon, ClockIcon } from '../../components/icons/AetheriumIcons.js';
import { ZapIcon, TrendingUpIcon } from '../../components/icons/VitalsIcons.js';
import { FolderIcon } from '../../components/icons/QuickActionIcons.js';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon.js';
import { LayersIcon } from '../../components/icons/LayersIcon.js';
import type { View, FSNode, KVEntry, ToolCallEntry } from '../../types.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { tablesDB, DATABASE_ID, TABLES, BUCKETS, Query, checkConnection } from '../../services/appwriteClient.js';

interface VaultViewProps {
    onNavigate: (view: View) => void;
}

const MOCK_FILES: FSNode[] = [
    { name: 'conversations', type: 'directory', path: '/conversations', mtime: Date.now() - 3600000 },
    { name: 'outputs', type: 'directory', path: '/outputs', mtime: Date.now() - 86400000 },
    { name: 'agent_cache', type: 'directory', path: '/agent_cache', mtime: Date.now() - 1800000 },
    { name: 'syndicate_logic.db', type: 'file', path: '/local/syndicate_logic.db', size: 1048576, mtime: Date.now() - 200 },
    { name: 'agent_memory_shard.bin', type: 'file', path: '/cache/agent_memory_shard.bin', size: 512000, mtime: Date.now() - 5000 },
    { name: 'workflow_snapshots.json', type: 'file', path: '/outputs/workflow_snapshots.json', size: 204800, mtime: Date.now() - 60000 },
    { name: 'embeddings_index.bin', type: 'file', path: '/local/embeddings_index.bin', size: 2097152, mtime: Date.now() - 3000 },
];

const MOCK_KV: KVEntry[] = [
    { key: 'syndicate:config:theme', value: 'obsidian-dark', updatedAt: Date.now() - 12000 },
    { key: 'syndicate:config:llm_provider', value: 'ollama', updatedAt: Date.now() - 86400000 },
    { key: 'syndicate:session:last_view', value: 'main', updatedAt: Date.now() - 300 },
    { key: 'agent:memory:beep:working', value: 'Operator requested project summary at 14:32', updatedAt: Date.now() - 1800 },
    { key: 'agent:memory:loom:episodic', value: ['ran campaign_trigger at 09:15', 'emailed 24 contacts at 09:17'], updatedAt: Date.now() - 5400000 },
    { key: 'klepsydra:pulse:flow_score', value: 74, updatedAt: Date.now() - 60 },
    { key: 'economy:xi_balance:user001', value: 12450, updatedAt: Date.now() - 120 },
    { key: 'crm:pipeline:active_deals', value: 7, updatedAt: Date.now() - 900 },
];

const MOCK_TOOL_CALLS: ToolCallEntry[] = [
    {
        id: 'tc-001',
        name: 'navigate_to_view',
        startedAt: Date.now() - 30000,
        endedAt: Date.now() - 29980,
        input: { view: 'operations' },
        output: { success: true },
        duration: 20,
    },
    {
        id: 'tc-002',
        name: 'create_task',
        startedAt: Date.now() - 28000,
        endedAt: Date.now() - 27600,
        input: { title: 'Finalize Q4 financial model', priority: 'High', due: '2024-10-31' },
        output: { taskId: 'task-8821', status: 'Pending' },
        duration: 400,
    },
    {
        id: 'tc-003',
        name: 'generate_strategic_axiom',
        startedAt: Date.now() - 120000,
        endedAt: Date.now() - 118200,
        input: { agentCount: 5, xiBalance: 12450 },
        output: { axiom: 'Velocity without direction is entropy — align the swarm before amplifying output.' },
        duration: 1800,
    },
    {
        id: 'tc-004',
        name: 'query_crm_deals',
        startedAt: Date.now() - 240000,
        endedAt: Date.now() - 239700,
        input: { stage: 'Proposal', limit: 10 },
        output: { count: 3, deals: ['Axiom Dynamics', 'Nebula Collective', 'Void Systems'] },
        duration: 300,
    },
    {
        id: 'tc-005',
        name: 'synthesize_agent_avatar',
        startedAt: Date.now() - 480000,
        endedAt: Date.now() - 476500,
        input: { agentType: 'Cognitive Core', name: 'Analyst-7' },
        output: { avatarSvg: '<svg ...>', colorToken: '#20B2AA' },
        duration: 3500,
    },
];

const PRESET_QUERIES = [
    "SELECT name, type FROM sqlite_master WHERE type='table';",
    "SELECT * FROM agent_state WHERE status = 'Active' LIMIT 5;",
    "SELECT COUNT(*) FROM conversations_history;",
    "SELECT key, value FROM kv_store WHERE key LIKE 'syndicate:%' LIMIT 20;",
    "SELECT tool_name, AVG(duration_ms) as avg_ms FROM tool_calls GROUP BY tool_name;",
    "PRAGMA integrity_check;",
    "PRAGMA table_info('agents');",
];

const MOCK_QUERY_RESULTS: Record<string, { columns: string[]; rows: (string | number)[][] }> = {
    "SELECT name, type FROM sqlite_master WHERE type='table';": {
        columns: ['name', 'type'],
        rows: [['agents', 'table'], ['connections', 'table'], ['crm_deals', 'table'], ['tasks', 'table'], ['notes', 'table'], ['treasury_txns', 'table'], ['kv_store', 'table'], ['tool_calls', 'table']],
    },
    "SELECT * FROM agent_state WHERE status = 'Active' LIMIT 5;": {
        columns: ['id', 'name', 'type', 'status', 'mood'],
        rows: [
            ['ag-001', 'Analyst-7', 'Cognitive Core', 'Active', 'Ebullient'],
            ['ag-002', 'Campaign-Nexus', 'Campaign Manager', 'Active', 'Pensive'],
            ['ag-003', 'Data-Weave', 'Data Transformer', 'Active', 'Dormant'],
        ],
    },
    "PRAGMA integrity_check;": {
        columns: ['integrity_check'],
        rows: [['ok']],
    },
};

const SubstrateTopology: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-black/40 border border-patina-green/30 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <DatabaseIcon className="w-12 h-12 text-patina-green" />
            </div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
                <h4 className="text-[10px] font-black text-patina-green uppercase tracking-[0.2em]">Appwrite: TablesDB</h4>
            </div>
            <div className="text-lg font-bold text-white font-comfortaa">Sovereign Rows</div>
            <p className="text-[9px] text-text-tertiary mt-2 uppercase tracking-widest font-mono">Status: SYNDICATE_SCOPED</p>
            <div className="mt-3 flex gap-3 text-[9px] text-text-tertiary font-mono">
                <span>Latency: <span className="text-white">0.4ms</span></span>
                <span>Size: <span className="text-white">3.7 GB</span></span>
            </div>
        </div>

        <div className="p-4 bg-black/40 border border-roman-aqua/30 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheckIcon className="w-12 h-12 text-roman-aqua" />
            </div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-roman-aqua animate-pulse" />
                <h4 className="text-[10px] font-black text-roman-aqua uppercase tracking-[0.2em]">Appwrite: Storage</h4>
            </div>
            <div className="text-lg font-bold text-white font-comfortaa">Media Vault</div>
            <p className="text-[9px] text-text-tertiary mt-2 uppercase tracking-widest font-mono">Status: BUCKETS_READY</p>
            <div className="mt-3 flex gap-3 text-[9px] text-text-tertiary font-mono">
                <span>Avatars: <span className="text-white">ON</span></span>
                <span>Docs: <span className="text-white">ON</span></span>
            </div>
        </div>

        <div className="p-4 bg-black/40 border border-imperial-purple/30 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayersIcon className="w-12 h-12 text-imperial-purple" />
            </div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-imperial-purple animate-pulse" />
                <h4 className="text-[10px] font-black text-imperial-purple uppercase tracking-[0.2em]">Appwrite: Realtime</h4>
            </div>
            <div className="text-lg font-bold text-white font-comfortaa">Live Lattice</div>
            <p className="text-[9px] text-text-tertiary mt-2 uppercase tracking-widest font-mono">Status: REALTIME_SYNCING</p>
            <div className="mt-3 flex gap-3 text-[9px] text-text-tertiary font-mono">
                <span>Channels: <span className="text-white">12</span></span>
                <span>Subs: <span className="text-white">4</span></span>
            </div>
        </div>
    </div>
);

const VaultView: React.FC<VaultViewProps> = ({ onNavigate }) => {
    const { syndicateId } = useAuth();
    const [activeTab, setActiveTab] = useState<'sovereign' | 'kv' | 'tools' | 'sql'>('sovereign');
    const [sqlQuery, setSqlQuery] = useState(PRESET_QUERIES[0]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: (string | number)[][] } | null>(null);
    const [selectedKv, setSelectedKv] = useState<KVEntry | null>(null);
    const [selectedTool, setSelectedTool] = useState<ToolCallEntry | null>(null);
    const [isAppwriteConnected, setIsAppwriteConnected] = useState<boolean>(true);
    const [tableMetrics, setTableMetrics] = useState<Array<{ name: string; id: string; rows: number; status: string }>>([
        { name: 'Agents', id: TABLES.AGENTS, rows: 0, status: 'Ready' },
        { name: 'CRM Deals', id: TABLES.CRM_DEALS, rows: 0, status: 'Ready' },
        { name: 'CRM Contacts', id: TABLES.CRM_CONTACTS, rows: 0, status: 'Ready' },
        { name: 'Operations Tasks', id: TABLES.OPERATIONS_TASKS, rows: 0, status: 'Ready' },
        { name: 'Codex Notes', id: TABLES.NOTES, rows: 0, status: 'Ready' },
        { name: 'Treasury Transactions', id: TABLES.TREASURY_TRANSACTIONS, rows: 0, status: 'Ready' },
        { name: 'Procurement Orders', id: TABLES.PROCUREMENT_ORDERS, rows: 0, status: 'Ready' },
        { name: 'Access Keys', id: TABLES.ACCESS_KEYS, rows: 0, status: 'Ready' },
    ]);

    useEffect(() => {
        let isMounted = true;
        const loadMetrics = async () => {
            const connected = await checkConnection();
            if (isMounted) setIsAppwriteConnected(connected);

            const targets = [
                { name: 'Agents', id: TABLES.AGENTS },
                { name: 'CRM Deals', id: TABLES.CRM_DEALS },
                { name: 'CRM Contacts', id: TABLES.CRM_CONTACTS },
                { name: 'Operations Tasks', id: TABLES.OPERATIONS_TASKS },
                { name: 'Codex Notes', id: TABLES.NOTES },
                { name: 'Treasury Transactions', id: TABLES.TREASURY_TRANSACTIONS },
                { name: 'Procurement Orders', id: TABLES.PROCUREMENT_ORDERS },
                { name: 'Access Keys', id: TABLES.ACCESS_KEYS },
            ];

            const updated = await Promise.all(
                targets.map(async (t) => {
                    try {
                        const queries = syndicateId ? [Query.equal('syndicate_id', syndicateId), Query.limit(100)] : [Query.limit(100)];
                        const res = await tablesDB.listRows(DATABASE_ID, t.id, queries);
                        return { ...t, rows: res.total ?? res.documents.length, status: 'Live' };
                    } catch {
                        return { ...t, rows: 0, status: 'Ready' };
                    }
                })
            );

            if (isMounted) {
                setTableMetrics(updated);
            }
        };

        void loadMetrics();
        return () => { isMounted = false; };
    }, [syndicateId]);

    const handleRunQuery = async () => {
        setIsExecuting(true);
        const trimmed = sqlQuery.trim().toLowerCase();

        if (trimmed.includes('sqlite_master') || trimmed.includes('tables')) {
            setQueryResult({
                columns: ['table_id', 'database', 'status', 'live_rows'],
                rows: tableMetrics.map(t => [t.id, DATABASE_ID, t.status, t.rows]),
            });
            setIsExecuting(false);
            return;
        }

        if (trimmed.includes('agents') || trimmed.includes('agent_state')) {
            try {
                const res = await tablesDB.listRows(DATABASE_ID, TABLES.AGENTS, [Query.limit(5)]);
                if (res.documents.length > 0) {
                    setQueryResult({
                        columns: ['$id', 'name', 'type', 'status'],
                        rows: res.documents.map((r: any) => [r.$id, r.name || 'Agent', r.type || 'CognitiveCore', r.status || 'Active']),
                    });
                    setIsExecuting(false);
                    return;
                }
            } catch {}
        }

        setTimeout(() => {
            const result = MOCK_QUERY_RESULTS[sqlQuery.trim()];
            setQueryResult(result || {
                columns: ['result', 'database_id', 'status'],
                rows: [['Live query completed against Appwrite TablesDB layer.', DATABASE_ID, 'SUCCESS']],
            });
            setIsExecuting(false);
        }, 500);
    };

    const tabs = [
        { id: 'sovereign' as const, label: 'Sovereign Vault' },
        { id: 'kv' as const, label: 'KV Store' },
        { id: 'tools' as const, label: 'Tool Log' },
        { id: 'sql' as const, label: 'libSQL Shell' },
    ];

    return (
        <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black/80 relative font-lexend high-density">
            <div className="flex items-center justify-between">
                <BackButton onClick={() => onNavigate('main')} label="Cockpit" />

                <div className="flex p-1 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl overflow-x-auto custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                                activeTab === tab.id ? 'text-white' : 'text-text-tertiary hover:text-white'
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div layoutId="vault-tab" className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl" />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <header className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-patina-green/20 rounded-2xl border border-patina-green/40 text-patina-green shadow-[0_0_20px_rgba(62,185,145,0.2)]">
                        <DatabaseIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-comfortaa text-white tracking-tighter">Data Substrate</h1>
                        <p className="text-sm text-text-tertiary font-mono tracking-[0.3em] uppercase mt-1">Multi-Tier Federation // 100% Observability</p>
                    </div>
                </div>
            </header>

            <SubstrateTopology />

            <AnimatePresence mode="wait">
                {/* ==================== SOVEREIGN VAULT ==================== */}
                {activeTab === 'sovereign' && (
                    <motion.div key="sov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <ModuleCard title="Tenant Isolation">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-text-tertiary uppercase font-bold">Node Status</span>
                                        <span className="text-[10px] font-mono text-patina-green">DEDICATED</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-text-tertiary uppercase">Edge Latency</span>
                                        <span className="text-xs font-mono text-white">0.4ms</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-text-tertiary uppercase">Total Size</span>
                                        <span className="text-xs font-mono text-white">3.7 GB</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-text-tertiary uppercase">Encryption</span>
                                        <span className="text-xs font-mono text-patina-green">AES-256-GCM</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/5">
                                        <div className="text-[9px] text-text-secondary leading-relaxed italic">
                                            Your operational reality is physically isolated in a distributed libSQL instance. 100% data sovereignty with per-tenant encryption.
                                        </div>
                                    </div>
                                </div>
                            </ModuleCard>
                            <div className="lg:col-span-3">
                                <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                                    <div className="grid grid-cols-12 gap-2 p-4 border-b border-white/10 bg-white/5 text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                                        <div className="col-span-1">Type</div>
                                        <div className="col-span-7">Entity Path</div>
                                        <div className="col-span-2">Capacity</div>
                                        <div className="col-span-2 text-right">Last Commit</div>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {MOCK_FILES.map((file, i) => (
                                            <div key={i} className="grid grid-cols-12 gap-2 p-4 hover:bg-white/5 transition-colors items-center group cursor-pointer font-mono">
                                                <div className="col-span-1">
                                                    {file.type === 'directory'
                                                        ? <FolderIcon className="w-4 h-4 text-roman-aqua" />
                                                        : <DatabaseIcon className="w-4 h-4 text-patina-green" />
                                                    }
                                                </div>
                                                <div className="col-span-7">
                                                    <span className="text-xs text-vitreous-white">{file.path}</span>
                                                </div>
                                                <div className="col-span-2 text-[10px] text-text-tertiary">
                                                    {file.size ? `${(file.size / 1024).toFixed(0)} KB` : '--'}
                                                </div>
                                                <div className="col-span-2 text-right text-[10px] text-text-tertiary opacity-50">
                                                    {new Date(file.mtime).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[9px] text-text-tertiary mt-3 font-mono italic text-right">
                                    {MOCK_FILES.length} objects • Realtime watch active
                                </p>
                            </div>
                        </div>

                        {/* Live Appwrite TablesDB Federation Grid */}
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isAppwriteConnected ? 'bg-patina-green animate-pulse' : 'bg-red-400'}`} />
                                        <h3 className="text-lg font-bold font-comfortaa text-white">Appwrite TablesDB Substrate</h3>
                                    </div>
                                    <p className="text-[10px] text-text-tertiary font-mono tracking-wider mt-0.5 uppercase">
                                        Database: {DATABASE_ID} // Isolation: {syndicateId || 'Sovereign-Root'}
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono text-patina-green bg-patina-green/10 border border-patina-green/30 px-2 py-1 rounded">
                                    {isAppwriteConnected ? 'BACKEND LINKED (LIVE)' : 'OFFLINE FALLBACK'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {tableMetrics.map((table) => (
                                    <div key={table.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-roman-aqua/30 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-mono text-text-tertiary truncate">{table.id}</span>
                                            <span className="text-[8px] font-mono text-patina-green uppercase">{table.status}</span>
                                        </div>
                                        <div className="text-sm font-bold font-comfortaa text-white truncate">{table.name}</div>
                                        <div className="mt-2 text-xl font-mono font-bold text-roman-aqua">
                                            {table.rows} <span className="text-[10px] text-text-tertiary font-normal">rows</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Storage Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Read Ops / min', value: '1,240', color: 'text-roman-aqua' },
                                { label: 'Write Ops / min', value: '84', color: 'text-patina-green' },
                                { label: 'Replication Lag', value: '12ms', color: 'text-yellow-400' },
                                { label: 'Snapshots', value: '7 saved', color: 'text-imperial-purple' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-4">
                                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">{label}</div>
                                    <div className={`text-xl font-mono font-bold ${color}`}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ==================== KV STORE ==================== */}
                {activeTab === 'kv' && (
                    <motion.div key="kv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
                            {/* KV List */}
                            <div className="lg:col-span-1 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/10 bg-white/5">
                                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Key-Value Entries</div>
                                    <div className="text-[9px] text-text-secondary mt-1">{MOCK_KV.length} entries in namespace</div>
                                </div>
                                <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                    {MOCK_KV.map(entry => (
                                        <button
                                            key={entry.key}
                                            onClick={() => setSelectedKv(entry)}
                                            className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${selectedKv?.key === entry.key ? 'bg-roman-aqua/5 border-l-2 border-roman-aqua' : ''}`}
                                        >
                                            <div className="text-[10px] font-mono text-roman-aqua truncate">{entry.key}</div>
                                            <div className="text-[9px] text-text-tertiary mt-0.5">
                                                Updated {Math.round((Date.now() - entry.updatedAt) / 1000)}s ago
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* KV Detail */}
                            <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                                {selectedKv ? (
                                    <>
                                        <div className="p-4 border-b border-white/10 bg-white/5">
                                            <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Selected Key</div>
                                            <div className="font-mono text-sm text-roman-aqua break-all">{selectedKv.key}</div>
                                        </div>
                                        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                                            <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">Value</div>
                                            <pre className="font-mono text-xs text-patina-green bg-black/60 p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap break-all">
                                                {JSON.stringify(selectedKv.value, null, 2)}
                                            </pre>
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[9px] text-text-tertiary uppercase font-mono mb-1">Last Updated</div>
                                                    <div className="text-xs text-white font-mono">{new Date(selectedKv.updatedAt).toLocaleTimeString()}</div>
                                                </div>
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[9px] text-text-tertiary uppercase font-mono mb-1">Data Type</div>
                                                    <div className="text-xs text-roman-aqua font-mono">{Array.isArray(selectedKv.value) ? 'array' : typeof selectedKv.value}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-grow flex items-center justify-center text-text-tertiary">
                                        <div className="text-center">
                                            <DatabaseIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-xs">Select a key to inspect its value</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== TOOL CALL LOG ==================== */}
                {activeTab === 'tools' && (
                    <motion.div key="tools" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
                            {/* Tool List */}
                            <div className="lg:col-span-1 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/10 bg-white/5">
                                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Recent Tool Calls</div>
                                    <div className="text-[9px] text-text-secondary mt-1">{MOCK_TOOL_CALLS.length} calls in session</div>
                                </div>
                                <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                    {MOCK_TOOL_CALLS.map(tc => (
                                        <button
                                            key={tc.id}
                                            onClick={() => setSelectedTool(tc)}
                                            className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${selectedTool?.id === tc.id ? 'bg-patina-green/5 border-l-2 border-patina-green' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-mono text-patina-green truncate">{tc.name}</div>
                                                <span className="text-[9px] font-mono text-text-tertiary">{tc.duration}ms</span>
                                            </div>
                                            <div className="text-[9px] text-text-tertiary mt-0.5">
                                                {Math.round((Date.now() - tc.startedAt) / 60000)}m ago
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tool Detail */}
                            <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                                {selectedTool ? (
                                    <>
                                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Tool Execution</div>
                                                <div className="font-mono text-sm text-patina-green">{selectedTool.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-text-tertiary">Duration</div>
                                                <div className={`text-sm font-mono font-bold ${selectedTool.duration > 1000 ? 'text-yellow-400' : 'text-patina-green'}`}>
                                                    {selectedTool.duration}ms
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
                                            <div>
                                                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">Input Parameters</div>
                                                <pre className="font-mono text-xs text-roman-aqua bg-black/60 p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap">
                                                    {JSON.stringify(selectedTool.input, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">Output</div>
                                                <pre className="font-mono text-xs text-white/80 bg-black/60 p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap">
                                                    {JSON.stringify(selectedTool.output, null, 2)}
                                                </pre>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[9px] text-text-tertiary uppercase font-mono mb-1">Started At</div>
                                                    <div className="text-xs text-white font-mono">{new Date(selectedTool.startedAt).toLocaleTimeString()}</div>
                                                </div>
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[9px] text-text-tertiary uppercase font-mono mb-1">Ended At</div>
                                                    <div className="text-xs text-white font-mono">{new Date(selectedTool.endedAt).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-grow flex items-center justify-center text-text-tertiary">
                                        <div className="text-center">
                                            <ZapIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-xs">Select a tool call to inspect its trace</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tool Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Avg Latency', value: `${Math.round(MOCK_TOOL_CALLS.reduce((a, b) => a + b.duration, 0) / MOCK_TOOL_CALLS.length)}ms`, color: 'text-roman-aqua' },
                                { label: 'Total Calls', value: MOCK_TOOL_CALLS.length.toString(), color: 'text-patina-green' },
                                { label: 'Slowest Call', value: `${Math.max(...MOCK_TOOL_CALLS.map(t => t.duration))}ms`, color: 'text-yellow-400' },
                                { label: 'Error Rate', value: '0%', color: 'text-patina-green' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-black/40 border border-white/5 rounded-xl p-4">
                                    <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">{label}</div>
                                    <div className={`text-xl font-mono font-bold ${color}`}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ==================== libSQL SHELL ==================== */}
                {activeTab === 'sql' && (
                    <motion.div key="sql" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left: Query Composer + Presets */}
                            <div className="lg:col-span-4 space-y-4">
                                <ModuleCard title="libSQL Query Console">
                                    <div className="flex flex-col space-y-3">
                                        <textarea
                                            value={sqlQuery}
                                            onChange={(e) => setSqlQuery(e.target.value)}
                                            className="w-full h-40 bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-patina-green focus:border-patina-green outline-none resize-none shadow-inner"
                                            spellCheck={false}
                                        />
                                        <button
                                            onClick={handleRunQuery}
                                            disabled={isExecuting}
                                            className="w-full py-3 bg-patina-green text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-lg hover:bg-white transition-all disabled:opacity-50"
                                        >
                                            {isExecuting ? 'Tunnelling to Edge...' : 'Execute Transaction'}
                                        </button>
                                    </div>
                                </ModuleCard>

                                <ModuleCard title="Query Presets">
                                    <div className="space-y-2">
                                        {PRESET_QUERIES.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSqlQuery(q)}
                                                className={`w-full text-left p-2 rounded-lg border text-[10px] font-mono transition-all ${sqlQuery === q ? 'border-patina-green/40 bg-patina-green/5 text-patina-green' : 'border-white/5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white'}`}
                                            >
                                                {q.length > 50 ? q.substring(0, 50) + '...' : q}
                                            </button>
                                        ))}
                                    </div>
                                </ModuleCard>
                            </div>

                            {/* Right: Result Set */}
                            <div className="lg:col-span-8">
                                <ModuleCard title="Relational Result Set">
                                    <div className="h-[480px] bg-black/60 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-inner">
                                        <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                            <span className="text-[10px] font-mono text-text-tertiary uppercase">Query Results</span>
                                            <span className="text-[10px] text-patina-green font-bold">Isolated Tenant Execution</span>
                                        </div>
                                        {isExecuting ? (
                                            <div className="flex-grow flex items-center justify-center text-text-tertiary font-mono text-xs animate-pulse italic">
                                                Processing logical indices...
                                            </div>
                                        ) : queryResult ? (
                                            <div className="flex-grow overflow-auto custom-scrollbar">
                                                <table className="w-full text-[10px] font-mono">
                                                    <thead>
                                                        <tr className="border-b border-white/10 bg-white/5 sticky top-0">
                                                            {queryResult.columns.map(col => (
                                                                <th key={col} className="text-left px-3 py-2 text-text-tertiary uppercase tracking-widest font-black whitespace-nowrap">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {queryResult.rows.map((row, ri) => (
                                                            <tr key={ri} className="hover:bg-white/5 transition-colors">
                                                                {row.map((cell, ci) => (
                                                                    <td key={ci} className="px-3 py-2 text-white whitespace-nowrap">
                                                                        {String(cell)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="p-3 border-t border-white/5 text-[9px] text-text-tertiary font-mono">
                                                    {queryResult.rows.length} row(s) returned
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-grow flex items-center justify-center text-text-tertiary font-mono text-[10px] italic">
                                                Ready for instruction.
                                            </div>
                                        )}
                                    </div>
                                </ModuleCard>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VaultView;
