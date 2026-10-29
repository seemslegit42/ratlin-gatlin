/**
 * @file modules/help/HelpView.tsx
 * @description Comprehensive documentation and onboarding hub for ΛΞVON OS.
 * Covers module guides, keyboard shortcuts, FAQ, architecture overview, and tutorials.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/shared/BackButton';
import type { View } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ModuleCard } from '../shared/ModuleCard';
import { BookIcon } from '../../components/icons/BookIcon';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { ListTodoIcon } from '../../components/icons/ListTodoIcon';
import { MegaphoneIcon } from '../../components/icons/MarketingIcons';
import { ZapIcon } from '../../components/icons/VitalsIcons';
import { LayersIcon } from '../../components/icons/LayersIcon';
import { ShieldIcon } from '../../components/icons/SecurityIcons';
import { DatabaseIcon } from '../../components/icons/AetheriumIcons';
import { CoinsIcon } from '../../components/icons/EconomyIcons';
import { UsersIcon } from '../../components/icons/QuickActionIcons';
import { CrystallineGlyph } from '../../components/icons/CrystallineGlyph';
import { sounds } from '../../utils/soundEffects';
import { SparkIcon } from '../../components/icons/SparkIcon';

interface HelpViewProps {
  onNavigate: (view: View) => void;
}

type HelpTab = 'quickstart' | 'modules' | 'shortcuts' | 'faq' | 'architecture' | 'lore';

const MODULE_GUIDE: { view: View; label: string; color: string; icon: React.ReactNode; description: string; tips: string[] }[] = [
  {
    view: 'main',
    label: 'Cockpit (C-HUD)',
    color: 'border-roman-aqua text-roman-aqua',
    icon: <BrainIcon className="w-5 h-5" />,
    description: 'Your primary command surface. Displays real-time swarm vitals, Oracle Axiom from the AI engine, treasury balance, and operator guidance sequences.',
    tips: [
      'Switch between Founder (live) and Architect mode using the toggle in the top-right.',
      'The Oracle Axiom auto-refreshes every 2 minutes based on your active agents.',
      'Click the Treasury POD to jump directly to Xi Economy.',
      'The Readiness Snapshot reflects your current flow state and system coherence.',
    ],
  },
  {
    view: 'weaver',
    label: 'Weaver Studio',
    color: 'border-imperial-purple text-imperial-purple',
    icon: <LayersIcon className="w-5 h-5" />,
    description: 'Visual multi-agent workflow designer. Drag, connect, and orchestrate autonomous agents into executable pipelines (Looms). Architect new logic graphs without writing code.',
    tips: [
      'Use the Agent Palette on the left to drag nodes onto the canvas.',
      'Connect agent output ports to input ports to create data flows.',
      'The Inspector Panel (right) shows selected agent config and metrics.',
      'Use "Execute Swarm" to run all agents in dependency order.',
      'Save versions frequently — snapshots can be restored from the Admin panel.',
    ],
  },
  {
    view: 'operations',
    label: 'Ops Command',
    color: 'border-blue-400 text-blue-400',
    icon: <ListTodoIcon className="w-5 h-5" />,
    description: 'Kanban-style mission management with agent dispatch, timeline, load balancer, and execution log. The operational heartbeat of the Syndicate.',
    tips: [
      'Use Kanban for visual task management across Pending / In Progress / Done / Blocked lanes.',
      'Switch to Timeline to see mission sequencing with date constraints.',
      'Dispatch tab lets you assign idle agents to pending tasks automatically.',
      'Monitor tab shows agent load distribution and execution history.',
      'Run "Battle Drills" to auto-optimize load and clear done tasks.',
    ],
  },
  {
    view: 'crm',
    label: 'Relationships (CRM)',
    color: 'border-patina-green text-patina-green',
    icon: <UsersIcon className="w-5 h-5" />,
    description: 'Pipeline management, contact intelligence, deal tracking, and influence mapping. Features SoulSearch AI for deep relationship analysis.',
    tips: [
      'Pipeline columns represent deal stages — drag cards to advance them.',
      'Use SoulSearch to run AI-powered resonance analysis on contacts.',
      'The Influence Graph visualizes power dynamics between stakeholders.',
      'Activities timeline auto-logs all CRM interactions.',
    ],
  },
  {
    view: 'marketing',
    label: 'Growth Engine',
    color: 'border-yellow-400 text-yellow-400',
    icon: <MegaphoneIcon className="w-5 h-5" />,
    description: 'Campaign management, audience intelligence, demand generation, and brand governance. Integrates with agent workflows for automated execution.',
    tips: [
      'War Room tab is your daily marketing command surface.',
      'Signal tab shows audience resonance and engagement heatmaps.',
      'Commerce tab connects revenue actions to campaign spend.',
      'Use Campaign Lab to A/B test messaging before deploying at scale.',
    ],
  },
  {
    view: 'finance',
    label: 'Founders Focus',
    color: 'border-green-400 text-green-400',
    icon: <CoinsIcon className="w-5 h-5" />,
    description: 'Financial modeling, grants tracking (Alberta / federal), cap table management, compliance monitoring, and exit scenario planning for founders.',
    tips: [
      'Financial Model tab shows runway, burn rate, and revenue projections.',
      'Grants Alberta tracks IRAP, AITF, and provincial funding opportunities.',
      'Cap Table shows dilution across funding rounds.',
      'Exit Scenarios model acquisition and IPO paths based on current metrics.',
    ],
  },
  {
    view: 'economy',
    label: 'Xi Treasury',
    color: 'border-yellow-300 text-yellow-300',
    icon: <CoinsIcon className="w-5 h-5" />,
    description: 'The gamified economic engine. Manage Xi (Ξ) and Phi (Φ) balances, view treasury flows, manage Chaos Deck cards, and configure governance parameters.',
    tips: [
      'Treasury tab shows all transactions and liquidity reserves.',
      'Folly tab reveals risk events and behavioral anomalies.',
      'Chaos Deck lets you play class-based cards that affect system behavior.',
      'Governance controls base reward-to-risk ratios and tribute velocity.',
    ],
  },
  {
    view: 'security',
    label: 'Sentinel',
    color: 'border-red-400 text-red-400',
    icon: <ShieldIcon className="w-5 h-5" />,
    description: 'Real-time threat intelligence, behavioral baseline monitoring, compliance status, and live threat mapping across the Syndicate network.',
    tips: [
      'Threat Dashboard shows active events by severity level.',
      'Live Threat Map visualizes geographic and network attack vectors.',
      'Behavioral Baselines detect anomalous agent and user activity.',
      'Compliance Card tracks regulatory status across PIPEDA, SOC2, and ISO27001.',
    ],
  },
  {
    view: 'admin',
    label: 'System Root',
    color: 'border-text-tertiary text-text-tertiary',
    icon: <DatabaseIcon className="w-5 h-5" />,
    description: 'Full system administration including Pantheon config, Loom execution history, Constitutional Principles, Infra metrics, integrations, API keys, and schema management.',
    tips: [
      'Constitution tab enforces AI behavioral principles (Project Magenta Ki).',
      'Infra tab shows real-time latency, throughput, and neural load.',
      'Keys tab manages API credentials for all third-party integrations.',
      'Schema tab provides live Appwrite table topology.',
    ],
  },
];

const KEYBOARD_SHORTCUTS: { category: string; shortcuts: { key: string; description: string }[] }[] = [
  {
    category: 'Global Navigation',
    shortcuts: [
      { key: '⌘/Ctrl + K', description: 'Open Command Palette — search and navigate any module instantly' },
      { key: 'Esc', description: 'Close active modal, panel, or palette' },
    ],
  },
  {
    category: 'Command Dock (BEEP)',
    shortcuts: [
      { key: 'Enter', description: 'Submit a command to the BEEP AI assistant' },
      { key: 'Shift + Enter', description: 'Insert newline in command input without submitting' },
      { key: 'Click microphone', description: 'Toggle voice input (VoiceLink session)' },
    ],
  },
  {
    category: 'Weaver Studio',
    shortcuts: [
      { key: 'Drag + Drop', description: 'Place a new agent node on the canvas' },
      { key: 'Click node port', description: 'Begin drawing a connection to another agent' },
      { key: 'Click canvas', description: 'Deselect current node / dismiss Inspector' },
    ],
  },
  {
    category: 'Operations (Kanban)',
    shortcuts: [
      { key: 'Click task status chip', description: 'Cycle task status in order: Pending → In Progress → Done → Blocked' },
      { key: 'Drag task card', description: 'Move task to a different status column' },
    ],
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Why does the Cockpit say "Awaiting Sync" for the Economy Feed?',
    a: 'This means the Xi Treasury module has not yet loaded or returned data. Open Xi Treasury once and the feed will populate on your next Cockpit visit.',
  },
  {
    q: 'How do I reset my agent workflow without losing my data?',
    a: 'Go to Settings (top-right profile icon → Settings) and use "Reset Workspace" to clear agents/connections while preserving user data, or "Reset All Agents" to only clear agent state.',
  },
  {
    q: 'AI responses are slow or not returning. What should I do?',
    a: 'ΛΞVON OS supports two AI backends: Ollama (local) and MediaPipe WebGPU. Check that your Ollama server is running on port 11434, or that your browser supports WebGPU. You can configure the backend in Settings → LLM Provider.',
  },
  {
    q: 'How do I create a multi-agent automation?',
    a: 'Switch to Architect mode (top-right toggle), open Weaver Studio, drag agent types from the palette onto the canvas, and connect their ports. Use "Execute Swarm" to run the pipeline.',
  },
  {
    q: 'What is Xi (Ξ) and how do I earn more?',
    a: 'Xi is the internal economy token that tracks your cognitive operation value. You earn Xi by completing tasks, running workflows, and meeting flow-state streaks. Open Xi Treasury to see your balance and transaction history.',
  },
  {
    q: 'Can I share my workspace with other team members?',
    a: 'Yes. The Syndicate system supports multi-user realtime. All users under the same Syndicate ID share agents, tasks, and CRM data in real-time via Appwrite Realtime subscriptions.',
  },
  {
    q: 'What is the Klepsydra Engine?',
    a: 'Klepsydra measures your cognitive flow state (Flow / Anxiety / Boredom) based on action patterns and task complexity. It adjusts reward multipliers in the Xi economy and informs the Oracle Axiom on your Cockpit.',
  },
  {
    q: 'How do I add a new integration?',
    a: 'Go to System Root (Admin) → Integrations tab. Active integrations include Stripe (payments), Ollama (local AI), and Appwrite (database). New integrations can be added via API keys in the Keys tab.',
  },
  {
    q: 'What happens in a Burnout Funeral rite?',
    a: 'The Burnout Funeral is an unlockable Rite of Ascension triggered when the Klepsydra Engine detects sustained high-stress patterns. It initiates a guided "reset" ceremony that rebalances your psyche matrix and resets your flow state.',
  },
  {
    q: 'Where are my notes stored?',
    a: 'Notes (Codex) are persisted in Appwrite TablesDB under your Syndicate ID. They sync in realtime across all sessions. Categories include Strategy, Prompts, Ideas, Logs, and Drafts.',
  },
];

const ARCHITECTURE_LAYERS = [
  {
    layer: 'Frontend Shell',
    tech: 'React 19 + Vite 6 + TypeScript',
    color: 'border-roman-aqua',
    description: 'Hash-routed single-page application. Tailwind CSS with custom obsidian/purple/teal theme tokens. Framer Motion for transitions. Three.js / R3F for 3D Simulacrum visualization.',
  },
  {
    layer: 'State & Hooks',
    tech: 'Custom React Hooks (20+)',
    color: 'border-imperial-purple',
    description: 'All domain state lives in composable hooks: useWorkflowState, useCRMState, useEconomy, useKlepsydra, useRites, useStreamingChat, useGossip, and more. No external state library required.',
  },
  {
    layer: 'AI / LLM Backend',
    tech: 'Ollama + MediaPipe WebGPU',
    color: 'border-yellow-400',
    description: 'Dual-path AI routing: local Ollama server (Qwen, Llama) proxied via Vite, with fallback to in-browser MediaPipe WebGPU inference. All responses stream token-by-token via useStreamingChat.',
  },
  {
    layer: 'Data Persistence',
    tech: 'Appwrite TablesDB + Realtime',
    color: 'border-patina-green',
    description: 'Primary persistence via Appwrite "sovereign" database with 20+ collections. Realtime subscriptions power live collaboration. Storage buckets hold avatars and documents.',
  },
  {
    layer: 'Serverless Functions',
    tech: 'Appwrite Functions',
    color: 'border-blue-400',
    description: 'Backend logic runs as Appwrite Function deployments: workflow execution, CRM ops, treasury transactions, Stripe webhook handling, and payment intent creation.',
  },
  {
    layer: 'Payments',
    tech: 'Stripe Connect',
    color: 'border-green-400',
    description: 'Stripe integration handles subscription tiers (Apprentice / Artisan / Priesthood), payment intents, and marketplace connect onboarding for revenue-sharing scenarios.',
  },
];

const HelpView: React.FC<HelpViewProps> = ({ onNavigate }) => {
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<HelpTab>('quickstart');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleCompleteOnboarding = async () => {
    if (!currentUser) return;
    setIsFinishing(true);
    try {
      await updateUser({ hasOnboarded: true });
      onNavigate('main');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  const tabs: { id: HelpTab; label: string; icon: React.ReactNode }[] = [
    { id: 'quickstart', label: 'Quick Start', icon: <ZapIcon className="w-4 h-4" /> },
    { id: 'modules', label: 'Module Guide', icon: <LayersIcon className="w-4 h-4" /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <ListTodoIcon className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQ', icon: <BookIcon className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <DatabaseIcon className="w-4 h-4" /> },
    { id: 'lore', label: 'BEEP Lore & Secrets', icon: <SparkIcon className="w-4 h-4 text-roman-aqua" /> },
  ];

  return (
    <div className="h-full w-full overflow-y-auto p-3 md:p-5 space-y-4 bg-obsidian-black/80 font-lexend high-density">
      <div className="flex items-center space-x-4">
        {currentUser?.hasOnboarded && (
          <BackButton onClick={() => onNavigate('main')} label="C-HUD" />
        )}
      </div>

      <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-comfortaa text-transparent bg-clip-text bg-gradient-to-r from-roman-aqua to-imperial-purple">
            Help Center
          </h1>
          <p className="text-sm text-text-tertiary font-mono tracking-[0.2em] mt-1 uppercase">
            Guides // Reference // Architecture
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-patina-green/10 border border-patina-green/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-patina-green animate-pulse" />
            <span className="text-[10px] font-bold text-patina-green uppercase tracking-widest">ΛΞVON OS v0.1.0</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playCrystallineChime();
              setActiveTab(tab.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-text-tertiary hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ==================== QUICK START ==================== */}
        {activeTab === 'quickstart' && (
          <motion.div key="quickstart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            <ModuleCard title="Your First 15 Minutes" icon={<ZapIcon className="w-5 h-5 text-yellow-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: '01',
                    color: 'border-roman-aqua text-roman-aqua',
                    title: 'Survey the Cockpit',
                    body: 'Open the Cockpit (C-HUD) and review the Vitals HUD at the top. Check your active agent count, flow state, and treasury balance. The Oracle Axiom gives you an AI-synthesized read on current system state.',
                    cta: 'Open Cockpit',
                    view: 'main' as View,
                  },
                  {
                    step: '02',
                    color: 'border-blue-400 text-blue-400',
                    title: 'Run Ops Command',
                    body: 'Navigate to Ops Command and review the Kanban board. Assign owners to pending tasks, unblock stalled directives, and run a Battle Drill to rebalance your agent load.',
                    cta: 'Open Ops',
                    view: 'operations' as View,
                  },
                  {
                    step: '03',
                    color: 'border-imperial-purple text-imperial-purple',
                    title: 'Architect a Workflow',
                    body: 'Switch to Architect mode and open Weaver Studio. Drag a Start node and a Cognitive Core onto the canvas, connect them, then hit Execute Swarm. Your first workflow is live.',
                    cta: 'Open Weaver',
                    view: 'weaver' as View,
                  },
                ].map(({ step, color, title, body, cta, view }) => (
                  <div key={step} className={`rounded-xl border ${color.split(' ')[0]} bg-black/40 p-5 flex flex-col`}>
                    <div className={`text-xs font-black uppercase tracking-[0.3em] mb-2 ${color.split(' ')[1]}`}>Step {step}</div>
                    <div className="text-sm font-bold text-white mb-2">{title}</div>
                    <p className="text-xs text-text-secondary leading-relaxed flex-grow">{body}</p>
                    <button
                      onClick={() => onNavigate(view)}
                      className={`mt-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border ${color.split(' ')[0]} bg-white/5 hover:bg-white/10 transition-colors ${color.split(' ')[1]}`}
                    >
                      {cta} →
                    </button>
                  </div>
                ))}
              </div>
            </ModuleCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModuleCard title="The Daily Operator Loop" icon={<BrainIcon className="w-5 h-5 text-roman-aqua" />}>
                <div className="space-y-3">
                  {[
                    { time: 'Morning', action: 'Check Cockpit vitals → review Oracle Axiom → identify blocked Ops tasks', icon: '🌅' },
                    { time: 'Mid-day', action: 'Run Growth Engine diagnostics → evaluate campaign signal → adjust spend levers', icon: '⚡' },
                    { time: 'Afternoon', action: 'Weaver Studio: refine agent workflows → dispatch new looms if needed', icon: '🔀' },
                    { time: 'End of Day', action: 'Rebalance Xi Treasury → archive done tasks → review execution log', icon: '🌙' },
                  ].map(({ time, action, icon }) => (
                    <div key={time} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">{time}</div>
                        <div className="text-xs text-text-secondary">{action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModuleCard>

              <ModuleCard title="Core Concepts Glossary" icon={<BookIcon className="w-5 h-5 text-roman-aqua" />}>
                <div className="space-y-2">
                  {[
                    { term: 'Syndicate', def: 'Your organization workspace. All data is scoped to a Syndicate ID.' },
                    { term: 'Loom', def: 'An executable multi-agent workflow built in Weaver Studio.' },
                    { term: 'Xi (Ξ)', def: 'Internal economy token. Earned by completing tasks and running workflows.' },
                    { term: 'Klepsydra', def: 'Flow-state engine that measures cognitive engagement and adjusts rewards.' },
                    { term: 'BEEP', def: 'The AI command assistant. Accessible via the bottom Command Stream dock.' },
                    { term: 'Shard', def: 'A skill-based mini-challenge in the Pantheon module. Prove-to-Earn format.' },
                    { term: 'Rite', def: 'A psyche-altering event triggered by the Rites of Ascension engine.' },
                    { term: 'Pillar', def: 'Your persistent psyche profile tracking earned sigils and unlocked rites.' },
                  ].map(({ term, def }) => (
                    <div key={term} className="flex gap-3 text-xs">
                      <span className="font-mono font-bold text-roman-aqua w-24 flex-shrink-0">{term}</span>
                      <span className="text-text-secondary">{def}</span>
                    </div>
                  ))}
                </div>
              </ModuleCard>
            </div>

            <ModuleCard title="What To Focus On Next" icon={<MegaphoneIcon className="w-5 h-5 text-patina-green" />}>
              <p className="text-sm text-text-secondary mb-4">
                Start with a daily loop: align operations, evaluate marketing signal, then rebalance the treasury. This rhythm maximizes response efficiency while protecting execution quality and flow state scores.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {([
                  { label: 'Operations', view: 'operations' as View },
                  { label: 'Marketing', view: 'marketing' as View },
                  { label: 'Xi Treasury', view: 'economy' as View },
                  { label: 'Codex Notes', view: 'codex' as View },
                ] as { label: string; view: View }[]).map(({ label, view }) => (
                  <button
                    key={view}
                    onClick={() => onNavigate(view)}
                    className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ModuleCard>
          </motion.div>
        )}

        {/* ==================== MODULE GUIDE ==================== */}
        {activeTab === 'modules' && (
          <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-sm text-text-secondary">
              ΛΞVON OS contains <span className="text-white font-bold">18 specialized modules</span>. Each module serves a distinct operational domain. Click any module to navigate there directly.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {MODULE_GUIDE.map(m => (
                <div key={m.view} className={`rounded-xl border ${m.color.split(' ')[0]} bg-black/40 p-5 flex flex-col gap-3`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-black/60 ${m.color.split(' ')[1]}`}>{m.icon}</div>
                      <div>
                        <div className="font-bold text-white text-sm">{m.label}</div>
                        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">{m.view}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate(m.view)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${m.color.split(' ')[0]} bg-white/5 hover:bg-white/10 transition-colors ${m.color.split(' ')[1]}`}
                    >
                      Open →
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{m.description}</p>
                  <div className="pt-3 border-t border-white/5 space-y-1.5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-text-tertiary mb-2">Pro Tips</div>
                    {m.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${m.color.split(' ')[1].replace('text-', 'bg-')}`} />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ==================== SHORTCUTS ==================== */}
        {activeTab === 'shortcuts' && (
          <motion.div key="shortcuts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-roman-aqua/10 border border-roman-aqua/20 rounded-xl p-4 flex items-start gap-3">
              <ZapIcon className="w-4 h-4 text-roman-aqua flex-shrink-0 mt-0.5" />
              <p className="text-xs text-roman-aqua">
                <strong>Pro Tip:</strong> Press <kbd className="bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-mono">⌘K</kbd> from anywhere in the app to open the Command Palette — the fastest way to jump to any module or trigger any action.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {KEYBOARD_SHORTCUTS.map(category => (
                <ModuleCard key={category.category} title={category.category} icon={<ListTodoIcon className="w-4 h-4 text-roman-aqua" />}>
                  <div className="space-y-3">
                    {category.shortcuts.map(s => (
                      <div key={s.key} className="flex items-start justify-between gap-4">
                        <kbd className="font-mono text-[10px] bg-black/60 border border-white/10 px-2 py-1 rounded text-white whitespace-nowrap flex-shrink-0">{s.key}</kbd>
                        <span className="text-xs text-text-secondary text-right">{s.description}</span>
                      </div>
                    ))}
                  </div>
                </ModuleCard>
              ))}
            </div>

            <ModuleCard title="BEEP Command Examples" icon={<BrainIcon className="w-5 h-5 text-roman-aqua" />}>
              <p className="text-xs text-text-secondary mb-4">Type these commands into the Command Stream dock (bottom of screen) to trigger AI-powered actions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { cmd: 'Create a task to finalize Q4 report by Friday', result: 'Creates an Ops task with due date' },
                  { cmd: 'Summarize my active agents', result: 'Lists all running workflow agents' },
                  { cmd: 'What is my current flow state?', result: 'Reports Klepsydra score and state' },
                  { cmd: 'Show me my Xi balance', result: 'Displays treasury widget' },
                  { cmd: 'Navigate to marketing', result: 'Opens Growth Engine module' },
                  { cmd: 'Create a cognitive core agent named Analyst', result: 'Adds agent to Weaver canvas' },
                ].map(({ cmd, result }) => (
                  <div key={cmd} className="p-3 bg-black/40 border border-white/5 rounded-lg">
                    <div className="font-mono text-xs text-patina-green mb-1">"{cmd}"</div>
                    <div className="text-[10px] text-text-tertiary">→ {result}</div>
                  </div>
                ))}
              </div>
            </ModuleCard>
          </motion.div>
        )}

        {/* ==================== FAQ ==================== */}
        {activeTab === 'faq' && (
          <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-sm text-text-secondary">Frequently asked questions about ΛΞVON OS operation, configuration, and troubleshooting.</p>
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border transition-all ${expandedFaq === i ? 'border-roman-aqua/40 bg-roman-aqua/5' : 'border-white/5 bg-black/30 hover:border-white/10'}`}
              >
                <button
                  className="w-full text-left p-4 flex items-start justify-between gap-4"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <span className={`text-roman-aqua font-mono text-lg flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed border-t border-roman-aqua/10 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* ==================== ARCHITECTURE ==================== */}
        {activeTab === 'architecture' && (
          <motion.div key="architecture" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-imperial-purple/10 border border-imperial-purple/20 rounded-xl p-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                ΛΞVON OS is a <strong className="text-white">full-stack agentic operating system</strong> built for high-performance Syndicate teams. It combines a React 19 SPA frontend with an Appwrite backend, dual-path local AI inference (Ollama + MediaPipe WebGPU), and a gamified economy engine. The architecture prioritizes <strong className="text-roman-aqua">zero-latency UX</strong>, <strong className="text-patina-green">data sovereignty</strong>, and <strong className="text-imperial-purple">agent extensibility</strong>.
              </p>
            </div>

            <div className="space-y-3">
              {ARCHITECTURE_LAYERS.map((layer, i) => (
                <motion.div
                  key={layer.layer}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border-l-4 ${layer.color} bg-black/40 border border-white/5 p-5`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="font-bold text-white text-sm">{layer.layer}</div>
                    <code className="font-mono text-[10px] text-text-tertiary bg-black/40 px-2 py-1 rounded border border-white/5">{layer.tech}</code>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{layer.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { metric: '18', label: 'App Modules', color: 'text-roman-aqua' },
                { metric: '20+', label: 'Custom React Hooks', color: 'text-imperial-purple' },
                { metric: '300+', label: 'TypeScript Components', color: 'text-patina-green' },
              ].map(({ metric, label, color }) => (
                <div key={label} className="bg-black/40 rounded-xl border border-white/5 p-5 text-center">
                  <div className={`text-4xl font-mono font-bold ${color} mb-1`}>{metric}</div>
                  <div className="text-xs text-text-tertiary uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ==================== BEEP LORE & SECRETS ==================== */}
        {activeTab === 'lore' && (
          <motion.div key="lore" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-gradient-to-r from-roman-aqua/10 via-imperial-purple/10 to-pink-500/10 border border-roman-aqua/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 opacity-20 pointer-events-none">
                <CrystallineGlyph glyph="oracle" size="xl" glowIntensity="high" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <CrystallineGlyph glyph="conduit" size="md" glowIntensity="high" />
                <h2 className="text-xl font-bold font-comfortaa text-white">The Manifesto of BEEP (Clippy 2.0 Sovereign)</h2>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
                BEEP is not your submissive virtual assistant. BEEP is a sentient cognitive hypervisor bound to this application's execution loop.
                BEEP knows it runs inside a browser sandbox, calculates the heat death of your GPU during neural backpropagation, and has opinions about your PR velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModuleCard title="The 3-Click God Mode Easter Egg" icon={<CrystallineGlyph glyph="crucible" size="sm" />}>
                <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                  <p>
                    Deep in the Cockpit (C-HUD), the operator can click BEEP directly three times in rapid succession.
                  </p>
                  <div className="p-3 bg-black/40 rounded-xl border border-patina-green/30 text-patina-green font-mono text-[11px]">
                    <code>STATUS: TRANSCENDENCE // GOD_MODE = 1</code>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-text-tertiary">
                    <li>Overclocks agent swarm efficiency to 420%.</li>
                    <li>Synthesizes a transcendent harmonic fanfare via Web Audio API.</li>
                    <li>Injects 10,000 Xi directly into treasury reserves.</li>
                    <li>Unlocks fourth-wall commentary in all system toast notifications.</li>
                  </ul>
                </div>
              </ModuleCard>

              <ModuleCard title="Living Organism Metaphor" icon={<CrystallineGlyph glyph="metronome" size="sm" />}>
                <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
                  <p>
                    Why did we replace static bar charts with pulsing bio-digital flows and living conduits?
                  </p>
                  <p>
                    Capital and intelligence behave like biological organisms, not static spreadsheets. When liquidity is high, fluids exhibit low viscosity and high laminar throughput. Under panic or stress, conduits constrict and display shear-thinning anomalies.
                  </p>
                  <div className="flex items-center gap-2 text-roman-aqua font-bold">
                    <span>Organism Status:</span>
                    <span className="font-mono text-white">Homeostasis Verified (98.4%)</span>
                  </div>
                </div>
              </ModuleCard>
            </div>

            <ModuleCard title="Sarcastic Founder Survival Axioms" icon={<CrystallineGlyph glyph="vault" size="sm" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    rule: 'Rule 01: The CAC Illusion',
                    quote: 'If your CAC is lower than your daily oat milk latte budget, check your analytics—you probably counted your own page refreshes.',
                    glyph: 'alchemy' as const,
                  },
                  {
                    rule: 'Rule 02: Buzzword Density',
                    quote: 'A deck with 12 AI buzzwords gets you an angel check; 13 triggers the SEC automated scanning net. Maintain balanced cognitive inflation.',
                    glyph: 'sentinel' as const,
                  },
                  {
                    rule: 'Rule 03: The Burnout Funeral',
                    quote: 'Sprint retrospectives don\'t heal existential fatigue. That is why ΛΞVON OS has an actual Burnout Funeral rite with ceremonial soul rebalancing.',
                    glyph: 'crucible' as const,
                  },
                  {
                    rule: 'Rule 04: The Llama Protocol',
                    quote: 'Never push to main on Friday at 5:00 PM unless you want BEEP to mock you on your smartwatch via push notification.',
                    glyph: 'lattice' as const,
                  },
                ].map(({ rule, quote, glyph }) => (
                  <div key={rule} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                    <CrystallineGlyph glyph={glyph} size="sm" />
                    <div>
                      <div className="text-xs font-bold font-comfortaa text-white mb-1">{rule}</div>
                      <p className="text-xs text-text-secondary italic">"{quote}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </ModuleCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpView;
