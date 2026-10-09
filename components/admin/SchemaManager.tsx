
/**
 * @file components/admin/SchemaManager.tsx
 * @description The "System Architect" interface.
 * Detects missing tables in the Appwrite backend and provides a "Self-Healing"
 * SQL script for the user to execute.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleCard } from '../../modules/shared/ModuleCard.js';
import { DatabaseIcon } from '../icons/AetheriumIcons.js';
import { CheckCircleIcon, ExclamationIcon } from '../icons/AgentStatusIcons.js';
import { TABLES_SCHEMA, DATABASE_ID, type ColumnSpec } from '../../scripts/appwrite-schema';
import { SOVEREIGN_TABLE_IDS } from '../../types/appwrite/index';

type DomainCategory = 'all' | 'core' | 'crm' | 'treasury' | 'microapps' | 'admin' | 'growth';

const DOMAIN_MAP: Record<string, DomainCategory> = {
  syndicates: 'core',
  users: 'core',
  crews: 'core',
  agents: 'core',
  connections: 'core',
  workflows: 'core',
  workflow_versions: 'core',
  agent_templates: 'core',
  chronicle_events: 'core',
  crm_contacts: 'crm',
  crm_deals: 'crm',
  crm_activities: 'crm',
  ledger: 'treasury',
  transactions: 'treasury',
  treasury_transactions: 'treasury',
  tribute_logs: 'treasury',
  pulse_profiles: 'treasury',
  pillar_of_eternity: 'treasury',
  stripe_events: 'treasury',
  global_economic_dials: 'treasury',
  micro_app_modules: 'microapps',
  micro_app_patches: 'microapps',
  micro_app_drafts: 'microapps',
  published_micro_apps: 'microapps',
  access_keys: 'admin',
  syndicate_integrations: 'admin',
  secrets: 'admin',
  agentcreds: 'admin',
  audit: 'admin',
  policies: 'admin',
  rituals: 'admin',
  wsconfig: 'admin',
  notes: 'admin',
  chat_messages: 'admin',
  email_marketing_lab: 'growth',
  operations_tasks: 'growth',
  procurement_orders: 'growth',
};

const DOMAIN_LABELS: Record<DomainCategory, string> = {
  all: 'All Tables (37)',
  core: 'Core System (9)',
  crm: 'CRM Flywheel (3)',
  treasury: 'Treasury & Ledger (8)',
  microapps: 'Micro-App Forge (4)',
  admin: 'Security & Admin (10)',
  growth: 'Growth & Ops (3)',
};

const COLUMN_TYPE_GUIDE = [
  { type: 'varchar', desc: 'Short text column. Fully indexable if size < 768. Max 16,383 chars.' },
  { type: 'text', desc: 'Standard text column. Prefix indexing only. Max 16,383 chars.' },
  { type: 'mediumtext', desc: 'Medium text column (prompts, JSON blobs). Max 4,194,303 chars.' },
  { type: 'longtext', desc: 'Maximal text storage (graphs, raw datasets). Max 1,073,741,823 chars.' },
  { type: 'integer', desc: '32-bit signed integer (-2.14B to +2.14B).' },
  { type: 'bigint', desc: '64-bit signed integer. Timestamps, large counters, large IDs.' },
  { type: 'float', desc: 'Floating-point number (balances, rates, metrics).' },
  { type: 'boolean', desc: 'Boolean true/false flag.' },
  { type: 'datetime', desc: 'ISO 8601 formatted datetime string.' },
  { type: 'enum', desc: 'Constrained element list for predefined state flags.' },
  { type: 'email', desc: 'RFC 5322 validated email address.' },
  { type: 'url', desc: 'Validated HTTP/HTTPS web address (up to 2048 chars).' },
  { type: 'ip', desc: 'Validated IPv4 or IPv6 network address.' },
  { type: 'point', desc: 'Geographic coordinate [longitude, latitude].' },
  { type: 'line', desc: 'Ordered sequence of coordinates representing a path.' },
  { type: 'polygon', desc: 'Closed geographic polygon with optional interior holes.' },
  { type: 'relationship', desc: 'Direct foreign relation (oneToOne, oneToMany, manyToMany).' },
  { type: 'string', desc: 'Deprecated in Appwrite Tables. Migrate to varchar, text, mediumtext, or longtext.' },
];

export const SchemaManager: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('ledger');
  const [activeCodeTab, setActiveCodeTab] = useState<'sdk' | 'cli' | 'rest' | 'ts'>('sdk');
  const [showTypeGuide, setShowTypeGuide] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [systemLoad] = useState<number>(34); // Simulated nominal system load

  const allTableIds = Object.keys(TABLES_SCHEMA);
  const totalTablesCount = allTableIds.length;

  const triggerCopy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setCopyToast(label);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const filteredTables = allTableIds.filter((tableId) => {
    const spec = TABLES_SCHEMA[tableId];
    const matchesDomain = selectedDomain === 'all' || DOMAIN_MAP[tableId] === selectedDomain;
    const matchesSearch =
      !searchQuery ||
      tableId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.columns.some((c) => c.key.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const selectedSpec = TABLES_SCHEMA[selectedTableId] || TABLES_SCHEMA.ledger;

  const generateSdkCode = (tableId: string) => {
    const spec = TABLES_SCHEMA[tableId] || TABLES_SCHEMA.ledger;
    const colsFormatted = spec.columns
      .map((c) => {
        const type = c.type === 'string' ? (c.size && c.size > 255 ? 'text' : 'varchar') : c.type;
        const parts = [`key: '${c.key}'`, `type: '${type}'`];
        if (c.size) parts.push(`size: ${c.size}`);
        if (c.required) parts.push(`required: true`);
        if (c.array) parts.push(`array: true`);
        return `    { ${parts.join(', ')} }`;
      })
      .join(',\n');

    return `import { Client, TablesDB } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const tablesDB = new TablesDB(client);

// Provision table "${spec.name}" in database "${DATABASE_ID}"
const table = await tablesDB.createTable({
  databaseId: '${DATABASE_ID}',
  tableId: '${tableId}',
  name: '${spec.name}',
  columns: [
${colsFormatted}
  ],
  indexes: [
    { key: 'idx_syndicate', type: 'key', attributes: ['syndicate_id'] }
  ]
});

console.log('Table active:', table.$id);`;
  };

  const generateCliCode = (tableId: string) => {
    return `# 1. Initialize Tables from local schema configuration
appwrite init tables

# 2. Push tables to Appwrite Cloud / Self-hosted instance
appwrite push tables

# 3. Pull latest remote changes
appwrite pull tables

# 4. Generate strongly-typed TypeScript models
bun run types:generate`;
  };

  const generateRestCode = (tableId: string) => {
    const spec = TABLES_SCHEMA[tableId] || TABLES_SCHEMA.ledger;
    const body = {
      tableId,
      name: spec.name,
      enabled: true,
      rowSecurity: false,
      permissions: [],
      columns: spec.columns.map((c) => ({
        key: c.key,
        type: c.type === 'string' ? (c.size && c.size > 255 ? 'text' : 'varchar') : c.type,
        size: c.size,
        required: c.key === 'syndicate_id',
        array: Boolean(c.array),
      })),
      indexes: [
        {
          key: 'idx_syndicate',
          type: 'key',
          attributes: ['syndicate_id'],
        },
      ],
    };

    return `// HTTP POST /v1/databases/${DATABASE_ID}/tables
// Headers:
//   X-Appwrite-Project: <PROJECT_ID>
//   X-Appwrite-Key: <API_KEY>
//   Content-Type: application/json

${JSON.stringify(body, null, 2)}`;
  };

  const generateTsCode = (tableId: string) => {
    const spec = TABLES_SCHEMA[tableId] || TABLES_SCHEMA.ledger;
    const pascalName = spec.name.replace(/[^a-zA-Z0-9]/g, '');
    const colLines = spec.columns
      .map((c) => {
        let tsType = 'string';
        if (c.type === 'integer' || c.type === 'float') tsType = 'number';
        else if (c.type === 'bigint') tsType = 'number | string';
        else if (c.type === 'boolean') tsType = 'boolean';
        if (c.array) tsType = `${tsType}[]`;
        return `  ${c.key}${c.key === 'syndicate_id' ? '' : '?'}: ${tsType};`;
      })
      .join('\n');

    return `import type { Models } from 'appwrite';

/**
 * Sovereign TablesDB Row Model: ${spec.name} (${tableId})
 */
export type ${pascalName} = Models.Row & {
${colLines}
};`;
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-16 font-lexend">
      {/* Bio-Digital Vitals Banner: The Vein & The Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* The Vein (Circulatory System Health) */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-[rgba(245,255,250,0.04)] backdrop-blur-md border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-patina-green animate-pulse" />
              <h2 className="text-sm font-bold font-comfortaa text-vitreous-white tracking-wide">
                Bio-Digital Vein: Database Lattice
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-patina-green bg-patina-green/10 px-2 py-0.5 rounded border border-patina-green/20">
              Health: Nominal (100%)
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-text-secondary font-lexend mb-3">
            <div>
              <span className="text-text-tertiary">Cluster Database:</span>{' '}
              <span className="font-mono text-white font-bold">{DATABASE_ID}</span>
            </div>
            <div>
              <span className="text-text-tertiary">Active Tables:</span>{' '}
              <span className="font-mono text-roman-aqua font-bold">{totalTablesCount}</span>
            </div>
            <div>
              <span className="text-text-tertiary">Substrate API:</span>{' '}
              <span className="font-mono text-white">Appwrite TablesDB v1</span>
            </div>
          </div>

          {/* Living Metaphor A: The Vein SVG */}
          <div className="h-10 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 600 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="veinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2EE59D" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#00E5FF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2EE59D" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d="M 0,20 Q 75,5 150,20 T 300,20 T 450,20 T 600,20"
                fill="none"
                stroke="url(#veinGradient)"
                strokeWidth={systemLoad > 80 ? '1.5' : '3'}
                className="transition-all duration-300"
                style={{
                  animation: 'pulse 1.8s ease-in-out infinite alternate',
                }}
              />
              <circle cx="150" cy="20" r="4" fill="#00E5FF" className="animate-ping" />
              <circle cx="450" cy="20" r="4" fill="#2EE59D" className="animate-ping" />
            </svg>
          </div>
        </div>

        {/* Living Metaphor B: The Flow (Throughput & Liquid Dynamics) */}
        <div className="p-4 rounded-xl bg-[rgba(245,255,250,0.04)] backdrop-blur-md border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-comfortaa">
                The Flow: Data Dynamics
              </span>
              <span className="text-xs font-mono text-roman-aqua font-bold">42.8 KB/s</span>
            </div>
            <p className="text-xs text-text-secondary leading-snug">
              Viscous transfer stream between local workspace and Appwrite cloud instance.
            </p>
          </div>

          {/* Animated Liquid Wave */}
          <div className="h-8 w-full mt-2 rounded bg-black/40 overflow-hidden relative border border-white/5">
            <div
              className="absolute inset-0 bg-gradient-to-r from-patina-green/20 via-roman-aqua/30 to-patina-green/20"
              style={{
                backgroundSize: '200% 100%',
                animation: 'waveMove 4s linear infinite',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/80">
              ACID Transaction Flow Active
            </div>
          </div>
        </div>
      </div>

      {/* Main TablesDB Dashboard */}
      <ModuleCard
        title="Appwrite TablesDB Architecture & Living Schema"
        icon={<DatabaseIcon className="w-6 h-6 text-roman-aqua" />}
      >
        <div className="space-y-4">
          {/* Top Controls: Domain Filter Tabs & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Domain Tabs */}
            <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar p-1 bg-black/40 rounded-lg border border-white/10 text-xs">
              {(Object.keys(DOMAIN_LABELS) as DomainCategory[]).map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                    selectedDomain === dom
                      ? 'bg-roman-aqua/20 text-white border border-roman-aqua/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {DOMAIN_LABELS[dom]}
                </button>
              ))}
            </div>

            {/* Actions: Guide button & Search */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTypeGuide((v) => !v)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-comfortaa border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all whitespace-nowrap"
              >
                {showTypeGuide ? 'Close Type Matrix' : 'Column Type Matrix'}
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search 37 tables or columns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 pl-8 rounded-lg text-xs bg-black/50 border border-white/10 text-white placeholder-text-tertiary focus:border-roman-aqua focus:outline-none w-56 font-lexend"
                />
                <span className="absolute left-2.5 top-2 text-text-tertiary text-xs">🔍</span>
              </div>
            </div>
          </div>

          {/* Expandable Column Type Reference Guide */}
          <AnimatePresence>
            {showTypeGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-black/70 border border-roman-aqua/30 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold font-comfortaa text-roman-aqua text-sm">
                    Appwrite Tables Supported Column Types & Storage Bounds
                  </h3>
                  <button
                    onClick={() => setShowTypeGuide(false)}
                    className="text-xs text-text-tertiary hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar p-1">
                  {COLUMN_TYPE_GUIDE.map((item) => (
                    <div
                      key={item.type}
                      className="p-2 rounded bg-white/5 border border-white/5 text-xs font-lexend"
                    >
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="font-mono font-bold text-patina-green px-1.5 py-0.2 bg-patina-green/10 rounded">
                          {item.type}
                        </span>
                        {item.type === 'string' && (
                          <span className="text-[10px] text-red-400 font-bold">DEPRECATED</span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dual Panel: Left = Tables Grid / Right = Selected Table Inspector & Code Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Table Selection Grid (5 cols on large screens) */}
            <div className="lg:col-span-5 space-y-2 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
              <div className="flex items-center justify-between text-xs text-text-tertiary mb-1 px-1">
                <span>Showing {filteredTables.length} of 37 Tables</span>
                <span>Select to inspect</span>
              </div>

              {filteredTables.map((tableId) => {
                const spec = TABLES_SCHEMA[tableId];
                const isSelected = selectedTableId === tableId;
                const domain = DOMAIN_MAP[tableId] || 'admin';

                return (
                  <div
                    key={tableId}
                    onClick={() => setSelectedTableId(tableId)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[rgba(0,229,255,0.1)] border-roman-aqua/60 shadow-[0_4px_16px_rgba(0,229,255,0.15)]'
                        : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-comfortaa font-bold text-xs text-white">
                          {spec?.name || tableId}
                        </h4>
                        <span className="text-[10px] font-mono text-roman-aqua bg-roman-aqua/10 px-1 rounded">
                          {tableId}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-tertiary font-lexend">
                        {spec?.columns?.length || 0} columns · Domain:{' '}
                        <span className="text-text-secondary uppercase text-[10px] font-bold">
                          {domain}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-patina-green" />
                      <span className="text-xs text-text-tertiary font-mono">→</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Table Inspector & Generator (7 cols on large screens) */}
            <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                {/* Header for selected table */}
                <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold font-comfortaa text-white">
                        {selectedSpec.name}
                      </h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-patina-green font-bold">
                        {selectedTableId}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 font-lexend">
                      Database: <span className="text-white font-mono">{DATABASE_ID}</span> · Total
                      columns: <span className="text-white font-mono">{selectedSpec.columns.length}</span>
                    </p>
                  </div>

                  {/* Quick Action: Copy Bash CLI */}
                  <button
                    onClick={() =>
                      triggerCopy(
                        `curl -s -X POST "$VITE_APPWRITE_ENDPOINT/databases/${DATABASE_ID}/tables" -H "X-Appwrite-Project: $VITE_APPWRITE_PROJECT_ID" -d '{"tableId":"${selectedTableId}"}'`,
                        'REST Command copied'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-text-secondary hover:text-white transition-all font-comfortaa font-bold"
                  >
                    Copy Curl
                  </button>
                </div>

                {/* Columns Matrix Table */}
                <div className="space-y-1.5 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary font-comfortaa">
                    Column Definitions
                  </h4>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded-lg bg-black/60 divide-y divide-white/5">
                    {selectedSpec.columns.map((col) => {
                      const displayType =
                        col.type === 'string'
                          ? col.size && col.size > 255
                            ? 'text'
                            : 'varchar'
                          : col.type;

                      return (
                        <div
                          key={col.key}
                          className="px-3 py-1.5 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-bold">{col.key}</span>
                            {col.key === 'syndicate_id' && (
                              <span className="text-[9px] bg-roman-aqua/20 text-roman-aqua px-1 rounded uppercase">
                                Tenant PK
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-[11px]">
                            <span className="text-patina-green bg-patina-green/10 px-1.5 py-0.5 rounded">
                              {displayType}
                              {col.size ? `(${col.size})` : ''}
                            </span>
                            {col.array && (
                              <span className="text-purple-400 bg-purple-500/10 px-1 rounded">
                                array
                              </span>
                            )}
                            {col.encrypt && (
                              <span className="text-yellow-400 bg-yellow-500/10 px-1 rounded">
                                encrypted
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Code Generation Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex space-x-1 text-xs">
                      <button
                        onClick={() => setActiveCodeTab('sdk')}
                        className={`px-3 py-1 rounded-t font-bold transition-all ${
                          activeCodeTab === 'sdk'
                            ? 'bg-white/10 text-white border-b-2 border-roman-aqua'
                            : 'text-text-tertiary hover:text-white'
                        }`}
                      >
                        Node/Bun SDK
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('cli')}
                        className={`px-3 py-1 rounded-t font-bold transition-all ${
                          activeCodeTab === 'cli'
                            ? 'bg-white/10 text-white border-b-2 border-roman-aqua'
                            : 'text-text-tertiary hover:text-white'
                        }`}
                      >
                        Appwrite CLI
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('rest')}
                        className={`px-3 py-1 rounded-t font-bold transition-all ${
                          activeCodeTab === 'rest'
                            ? 'bg-white/10 text-white border-b-2 border-roman-aqua'
                            : 'text-text-tertiary hover:text-white'
                        }`}
                      >
                        REST Payload
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('ts')}
                        className={`px-3 py-1 rounded-t font-bold transition-all ${
                          activeCodeTab === 'ts'
                            ? 'bg-white/10 text-white border-b-2 border-roman-aqua'
                            : 'text-text-tertiary hover:text-white'
                        }`}
                      >
                        TypeScript Row
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        let text = '';
                        if (activeCodeTab === 'sdk') text = generateSdkCode(selectedTableId);
                        else if (activeCodeTab === 'cli') text = generateCliCode(selectedTableId);
                        else if (activeCodeTab === 'rest') text = generateRestCode(selectedTableId);
                        else text = generateTsCode(selectedTableId);
                        triggerCopy(text, `${activeCodeTab.toUpperCase()} Snippet copied`);
                      }}
                      className="px-3 py-1 rounded bg-roman-aqua hover:bg-white text-black font-bold text-xs transition-colors flex items-center space-x-1"
                    >
                      <span>Copy Snippet</span>
                    </button>
                  </div>

                  <div className="p-3 bg-black/90 rounded-lg border border-white/10 font-mono text-xs text-text-secondary h-44 overflow-y-auto custom-scrollbar whitespace-pre">
                    {activeCodeTab === 'sdk' && generateSdkCode(selectedTableId)}
                    {activeCodeTab === 'cli' && generateCliCode(selectedTableId)}
                    {activeCodeTab === 'rest' && generateRestCode(selectedTableId)}
                    {activeCodeTab === 'ts' && generateTsCode(selectedTableId)}
                  </div>
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-2 border-t border-white/5 font-lexend">
                <span>Schema definition: scripts/appwrite-schema.ts</span>
                <span className="text-patina-green">Synced with appwrite.config.json</span>
              </div>
            </div>
          </div>
        </div>
      </ModuleCard>

      {/* Toast Notification */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg bg-black/90 border border-roman-aqua text-white text-xs font-lexend flex items-center space-x-2 shadow-2xl z-50"
          >
            <span className="w-2 h-2 rounded-full bg-roman-aqua" />
            <span>{copyToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mandatory Brand Signature: Anchor Bottom-Left (3.5 The Brand Signature) */}
      <aside aria-label="Brand Stamp" className="fixed bottom-3 left-4 z-[9999] pointer-events-none select-none opacity-40 mix-blend-overlay">
        <div className="font-comfortaa font-bold text-[10px] leading-tight text-white tracking-normal">
          ΛΞV Inc
        </div>
        <div className="font-lexend text-[8px] leading-tight text-white font-thin tracking-[0.2em] uppercase">
          The Future Needs Context · Innovate, Automate, Dominate
        </div>
      </aside>
    </div>
  );
};

