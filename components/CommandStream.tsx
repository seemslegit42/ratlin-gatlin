
/**
 * @file components/CommandStream.tsx
 * @description BEEP Command Stream — the conversational Activity Stream.
 *
 * Implements the Verdigris Protocol spec §2.2 "Unified Activity Stream":
 *   • GlassCard bubbles — edge-lit, translucent, source-aware
 *   • User commands on the right; BEEP/AEGIS responses on the left
 *   • Consecutive-source grouping to reduce visual noise
 *   • Hover copy action on BEEP messages
 *   • Inline Micro-Frontend widget rendering
 *   • Empty state with contextual starter prompts
 *   • Animated streaming cursor
 */

import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type {
  ChatMessage, WidgetData, View, JsonObject,
  InvoiceWidgetData, OnboardingWidgetData, CashFlowWidgetData,
  DiagnosticsWidgetData, NavigationWidgetData, TaskWidgetData,
  SecurityAlertWidgetData, MorningBriefWidgetData,
  CrmContactWidgetData, RevenueChartWidgetData, WorkflowScaffoldWidgetData,
} from '../types.js';
import { MessageSource, WidgetType } from '../types.js';

import InvoiceWidget        from './widgets/InvoiceWidget.js';
import OnboardingWidget     from './widgets/OnboardingWidget.js';
import CashFlowWidget       from './widgets/CashFlowWidget.js';
import DiagnosticsWidget    from './widgets/DiagnosticsWidget.js';
import NavigationWidget     from './widgets/NavigationWidget.js';
import TaskWidget           from './widgets/TaskWidget.js';
import SecurityAlertWidget  from './widgets/SecurityAlertWidget.js';
import MorningBriefWidget   from './widgets/MorningBriefWidget.js';
import MarkdownRenderer     from './shared/MarkdownRenderer.js';

// ─── Source configuration ─────────────────────────────────────────────────────

interface SourceCfg {
  label: string;
  color: string;
  glowColor: string;
  avatar: string;
}

const SOURCE_CFG: Record<string, SourceCfg> = {
  [MessageSource.BEEP]:   { label: 'BEEP',   color: '#3EB991', glowColor: 'rgba(62,185,145,0.18)',  avatar: '◈' },
  [MessageSource.AEGIS]:  { label: 'AEGIS',  color: '#20B2AA', glowColor: 'rgba(32,178,170,0.18)',  avatar: '⬡' },
  [MessageSource.SYSTEM]: { label: 'SYSTEM', color: '#6b7280', glowColor: 'rgba(107,114,128,0.10)', avatar: '◯' },
};

// Group consecutive messages from the same source if within 90 s
const GROUP_THRESHOLD_MS = 90_000;

// ─── Starter prompt suggestions (empty state) ─────────────────────────────────

const STARTER_PROMPTS = [
  'Give me my morning briefing',
  'Show swarm diagnostic',
  'What\'s in my pipeline?',
  'Run the workflow',
  'Show cash flow report',
  'Check security status',
  'Create a task',
  'Summarise today\'s ops',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommandStreamProps {
  messages: ChatMessage[];
  onWidgetInteraction: (command: string) => void;
  onNavigate: (view: View) => void;
}

interface MessageProps {
  message: ChatMessage;
  onWidgetInteraction: (command: string) => void;
  onNavigate: (view: View) => void;
  isLast: boolean;
  /** True when the previous message is from the same source within GROUP_THRESHOLD_MS */
  isGrouped: boolean;
}

// ─── Copy icon ────────────────────────────────────────────────────────────────

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Message ──────────────────────────────────────────────────────────────────

const Message: React.FC<MessageProps> = memo(({ message, onWidgetInteraction, onNavigate, isLast, isGrouped }) => {
  const isUser   = message.source === MessageSource.USER;
  const isSystem = message.source === MessageSource.SYSTEM;
  const [copied, setCopied] = useState(false);

  const srcCfg = SOURCE_CFG[message.source] ?? {
    label: message.userName ?? 'USER',
    color: message.userColor ?? 'rgba(255,255,255,0.55)',
    glowColor: message.userColor ? `${message.userColor}20` : 'rgba(255,255,255,0.07)',
    avatar: message.userName?.[0]?.toUpperCase() ?? '?',
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.text]);

  // Widget renderer
  const renderWidget = (widget: JsonObject): React.ReactNode => {
    const data = widget as unknown as WidgetData;
    switch (data.type) {
      case WidgetType.INVOICE:        return <InvoiceWidget       data={widget as unknown as InvoiceWidgetData}       />;
      case WidgetType.ONBOARDING:     return <OnboardingWidget    data={widget as unknown as OnboardingWidgetData}    />;
      case WidgetType.CASH_FLOW:      return <CashFlowWidget      data={widget as unknown as CashFlowWidgetData}      onInteraction={onWidgetInteraction} />;
      case WidgetType.DIAGNOSTICS:    return <DiagnosticsWidget   data={widget as unknown as DiagnosticsWidgetData}   />;
      case WidgetType.NAVIGATION:     return <NavigationWidget    data={widget as unknown as NavigationWidgetData}    onNavigate={onNavigate} />;
      case WidgetType.TASK:           return <TaskWidget          data={widget as unknown as TaskWidgetData} onInteraction={onWidgetInteraction} onNavigate={onNavigate} />;
      case WidgetType.SECURITY_ALERT: return <SecurityAlertWidget data={widget as unknown as SecurityAlertWidgetData} onInteraction={onWidgetInteraction} />;
      case WidgetType.MORNING_BRIEF:  return <MorningBriefWidget  data={widget as unknown as MorningBriefWidgetData} onInteraction={onWidgetInteraction} />;
      case WidgetType.CRM_CONTACT:     return <CrmContactCard     data={widget as unknown as CrmContactWidgetData}    onInteraction={onWidgetInteraction} />;
      case WidgetType.REVENUE_CHART:   return <RevenueChartCard   data={widget as unknown as RevenueChartWidgetData}  onInteraction={onWidgetInteraction} />;
      case WidgetType.WORKFLOW_SCAFFOLD: return <WorkflowScaffoldCard data={widget as unknown as WorkflowScaffoldWidgetData} onNavigate={onNavigate} />;
      default: return null;
    }
  };

  // ── Transcription (voice) — minimal pill ───────────────────────────────────
  if (message.isInputTranscription || message.isOutputTranscription) {
    return (
      <div className={`text-[10px] text-text-tertiary mb-0.5 font-mono opacity-50 italic ${isUser ? 'text-right pr-2' : 'text-left pl-2'}`}>
        {message.text}
      </div>
    );
  }

  // ── System — centered status pill ──────────────────────────────────────────
  if (isSystem) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-4"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/3 border border-white/8 rounded-full backdrop-blur-sm">
          <div className="w-1 h-1 rounded-full bg-white/25" />
          <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest">{message.text}</span>
        </div>
      </motion.div>
    );
  }

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`flex mb-1 ${isUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-4'}`}
    >
      {/* BEEP/AEGIS avatar column */}
      {!isUser && (
        <div className="flex flex-col items-center mr-2.5 flex-shrink-0" style={{ width: 28 }}>
          {!isGrouped && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border flex-shrink-0"
              style={{
                backgroundColor: `${srcCfg.color}18`,
                borderColor: `${srcCfg.color}40`,
                color: srcCfg.color,
                boxShadow: `0 0 10px ${srcCfg.glowColor}`,
              }}
            >
              {srcCfg.avatar}
            </div>
          )}
        </div>
      )}

      {/* Bubble + meta */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[82%] relative group`}>
        {/* Source label + timestamp — only on non-grouped first messages */}
        {!isGrouped && (
          <div className={`flex items-center gap-2 mb-1 px-0.5 ${isUser ? 'flex-row-reverse' : ''}`}>
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: srcCfg.color }}
            >
              {isUser ? (message.userName || 'You') : srcCfg.label}
            </span>
            <span className="text-[8px] text-text-tertiary font-mono">{timeStr}</span>
          </div>
        )}

        {/* GlassCard bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm
            ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
          `}
          style={isUser ? {
            background: message.userColor ? `${message.userColor}16` : 'rgba(255,255,255,0.09)',
            border: `1px solid ${message.userColor ? `${message.userColor}2e` : 'rgba(255,255,255,0.12)'}`,
          } : {
            background: 'rgba(12,12,18,0.55)',
            border: `1px solid rgba(255,255,255,0.09)`,
            boxShadow: `inset 0 0 0 1px ${srcCfg.glowColor}, 0 2px 12px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Left accent glow for BEEP/AEGIS */}
          {!isUser && (
            <div
              className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full opacity-60"
              style={{ backgroundColor: srcCfg.color }}
            />
          )}

          <div className={!isUser ? 'pl-2' : ''}>
            <MarkdownRenderer content={message.text} />
            {/* Streaming cursor */}
            {!isUser && isLast && !message.isFinal && (
              <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
                {[0, 0.15, 0.3].map((d, i) => (
                  <motion.span
                    key={i}
                    className="inline-block w-1 h-1 rounded-full"
                    style={{ backgroundColor: srcCfg.color }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Widget — sits below the bubble */}
        {message.widget && (
          <div className={`mt-2 w-full ${isUser ? '' : 'pl-0'}`}>
            {renderWidget(message.widget)}
          </div>
        )}

        {/* Copy action (hover, BEEP messages only, after streaming) */}
        {!isUser && message.isFinal !== false && (
          <AnimatePresence>
            <motion.button
              onClick={handleCopy}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute -right-7 top-1 p-1.5 rounded-lg bg-obsidian-black/80 border border-white/10 text-text-tertiary hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              title={copied ? 'Copied!' : 'Copy'}
              aria-label="Copy message"
            >
              {copied
                ? <CheckIcon className="w-3 h-3 text-patina-green" />
                : <CopyIcon  className="w-3 h-3" />
              }
            </motion.button>
          </AnimatePresence>
        )}

        {/* Grouped timestamp (hover) */}
        {isGrouped && (
          <div className={`mt-0.5 px-1 text-[8px] font-mono text-text-tertiary opacity-0 group-hover:opacity-50 transition-opacity ${isUser ? 'text-right' : 'text-left'}`}>
            {timeStr}
          </div>
        )}
      </div>

      {/* User avatar column */}
      {isUser && (
        <div className="flex flex-col items-center ml-2.5 flex-shrink-0" style={{ width: 28 }}>
          {!isGrouped && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0"
              style={{
                backgroundColor: message.userColor ? `${message.userColor}20` : 'rgba(255,255,255,0.08)',
                borderColor: message.userColor ? `${message.userColor}40` : 'rgba(255,255,255,0.12)',
                color: message.userColor ?? 'rgba(255,255,255,0.7)',
              }}
            >
              {(message.userName?.[0] ?? 'U').toUpperCase()}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

Message.displayName = 'Message';

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onSuggest: (cmd: string) => void }> = ({ onSuggest }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[180px] py-8 px-4 text-center"
  >
    {/* Animated BEEP sigil */}
    <div className="relative mb-5">
      <div className="w-12 h-12 rounded-full bg-patina-green/8 border border-patina-green/20 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-patina-green/80"
          style={{ boxShadow: '0 0 12px var(--patina-green)' }} />
      </div>
      <motion.div
        className="absolute inset-0 rounded-full border border-patina-green/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </div>

    <p className="text-sm font-comfortaa text-white/60 mb-1">Neural uplink ready</p>
    <p className="text-[10px] text-text-tertiary mb-5 font-mono">What shall we architect today?</p>

    <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
      {STARTER_PROMPTS.map(p => (
        <button
          key={p}
          onClick={() => onSuggest(p)}
          className="text-[10px] px-3 py-1.5 rounded-full bg-white/4 border border-white/10 text-text-secondary hover:bg-patina-green/10 hover:border-patina-green/30 hover:text-patina-green transition-all"
        >
          {p}
        </button>
      ))}
    </div>
  </motion.div>
);

// ─── CommandStream ────────────────────────────────────────────────────────────

const CommandStream: React.FC<CommandStreamProps> = ({ messages, onWidgetInteraction, onNavigate }) => {
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState onSuggest={onWidgetInteraction} />;
  }

  return (
    <div className="pb-4 px-1 high-density">
      {messages.map((msg, index) => {
        const prev = messages[index - 1];
        const isGrouped =
          !!prev &&
          prev.source === msg.source &&
          msg.timestamp - prev.timestamp < GROUP_THRESHOLD_MS &&
          !prev.isInputTranscription &&
          !prev.isOutputTranscription &&
          msg.source !== MessageSource.SYSTEM;

        return (
          <Message
            key={msg.id}
            message={msg}
            onWidgetInteraction={onWidgetInteraction}
            onNavigate={onNavigate}
            isLast={index === messages.length - 1}
            isGrouped={isGrouped}
          />
        );
      })}
      <div ref={streamEndRef} className="h-2" />
    </div>
  );
};

export default CommandStream;

// ─── Inline Micro-Frontend: CRM Contact Card (spec §2.2, §5 CRM) ─────────────

const CrmContactCard: React.FC<{ data: CrmContactWidgetData; onInteraction: (cmd: string) => void }> = ({ data, onInteraction }) => {
  const [editing, setEditing] = React.useState(false);
  const [note, setNote] = React.useState('');

  const initials = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const stageColors: Record<string, string> = {
    Lead:      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Prospect:  'text-roman-aqua bg-roman-aqua/10 border-roman-aqua/20',
    Qualified: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Proposal:  'text-imperial-purple bg-imperial-purple/10 border-imperial-purple/20',
    Closed:    'text-patina-green bg-patina-green/10 border-patina-green/20',
  };
  const stageClass = stageColors[data.dealStage ?? ''] ?? 'text-text-tertiary bg-white/5 border-white/10';

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: data.avatarColor ?? '#6A0DAD' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-vitreous-white truncate">{data.name}</div>
          <div className="text-[10px] text-text-tertiary truncate">{data.role} · {data.company}</div>
        </div>
        {data.dealStage && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${stageClass}`}>
            {data.dealStage}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 text-[10px] font-mono">
        {data.email && <div className="truncate"><span className="text-text-tertiary">EMAIL </span><span className="text-vitreous-white">{data.email}</span></div>}
        {data.phone && <div className="truncate"><span className="text-text-tertiary">TEL </span><span className="text-vitreous-white">{data.phone}</span></div>}
        {data.dealValue != null && <div><span className="text-text-tertiary">VALUE </span><span className="text-patina-green font-bold">${data.dealValue.toLocaleString()}</span></div>}
        {data.score != null && <div><span className="text-text-tertiary">SCORE </span><span className="text-roman-aqua font-bold">{data.score}</span></div>}
        {data.lastActivity && <div className="col-span-2 truncate"><span className="text-text-tertiary">LAST ACT </span><span className="text-text-secondary">{data.lastActivity}</span></div>}
      </div>
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {data.tags.map(tag => (
            <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-tertiary">{tag}</span>
          ))}
        </div>
      )}
      {editing ? (
        <div className="px-3 pb-3 flex gap-2">
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Log activity note…"
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none placeholder-text-tertiary"
            onKeyDown={e => {
              if (e.key === 'Enter' && note.trim()) { onInteraction(`Log activity for ${data.name} at ${data.company}: ${note}`); setNote(''); setEditing(false); }
              if (e.key === 'Escape') setEditing(false);
            }} autoFocus />
          <button onClick={() => setEditing(false)} className="text-[10px] text-text-tertiary hover:text-white px-2">Cancel</button>
        </div>
      ) : (
        <div className="flex gap-2 px-3 pb-3">
          <button onClick={() => setEditing(true)}
            className="flex-1 py-1 text-[9px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-text-secondary hover:text-white transition-all">
            Log Activity
          </button>
          <button onClick={() => onInteraction(`Show full CRM profile and deal history for ${data.name} at ${data.company}`)}
            className="flex-1 py-1 text-[9px] font-bold uppercase tracking-wider bg-roman-aqua/10 hover:bg-roman-aqua/20 border border-roman-aqua/20 rounded-lg text-roman-aqua transition-all">
            Full Profile
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Inline Micro-Frontend: Revenue / Pipeline Chart (spec §2.2) ──────────────

const RevenueChartCard: React.FC<{ data: RevenueChartWidgetData; onInteraction: (cmd: string) => void }> = ({ data, onInteraction }) => {
  const max = Math.max(...data.breakdown.map(b => b.value), 1);
  const currency = data.currency ?? '$';
  const fmt = (n: number) => n >= 1_000_000 ? `${currency}${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${currency}${(n / 1_000).toFixed(0)}K` : `${currency}${n}`;

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-vitreous-white">{data.title}</div>
          {data.period && <div className="text-[9px] text-text-tertiary font-mono">{data.period}</div>}
        </div>
        <div className="text-right">
          <div className="text-sm font-bold font-mono text-patina-green">{fmt(data.totalValue)}</div>
          {data.trend != null && (
            <div className={`text-[9px] font-mono ${data.trend >= 0 ? 'text-patina-green' : 'text-red-400'}`}>
              {data.trend >= 0 ? '+' : ''}{data.trend.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        {data.breakdown.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="text-[9px] font-mono text-text-tertiary w-20 truncate flex-shrink-0">{item.label}</div>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full" style={{ backgroundColor: item.color ?? 'var(--roman-aqua)' }} />
            </div>
            <div className="text-[9px] font-mono text-text-secondary w-12 text-right flex-shrink-0">{fmt(item.value)}</div>
          </div>
        ))}
      </div>
      <button onClick={() => onInteraction(`Generate a detailed revenue breakdown and forecast for ${data.title}`)}
        className="w-full py-1 text-[9px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-text-secondary hover:text-white transition-all">
        Full Report →
      </button>
    </div>
  );
};

// ─── Inline Micro-Frontend: Workflow Scaffold Preview (spec §3.3) ─────────────

const WorkflowScaffoldCard: React.FC<{ data: WorkflowScaffoldWidgetData; onNavigate: (v: View) => void }> = ({ data, onNavigate }) => (
  <div className="rounded-xl border border-imperial-purple/30 bg-imperial-purple/5 p-3 space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-bold text-vitreous-white">{data.workflowName}</div>
        <div className="text-[9px] text-text-tertiary">{data.description}</div>
      </div>
      <div className="text-right">
        <div className="text-[9px] font-mono text-imperial-purple">{data.completionPct}% scaffolded</div>
        <div className="text-[8px] text-text-tertiary">{data.estimatedNodes} nodes</div>
      </div>
    </div>
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${data.completionPct}%` }}
        transition={{ duration: 1 }} className="h-full bg-imperial-purple rounded-full" />
    </div>
    <div className="space-y-1">
      {data.phases.map((phase, i) => (
        <div key={i} className="flex items-start gap-2 text-[9px]">
          <span className="text-imperial-purple font-mono mt-0.5">▸</span>
          <div>
            <span className="text-white font-bold">{phase.label}</span>
            <span className="text-text-tertiary ml-1">{phase.agents.join(', ')}</span>
          </div>
        </div>
      ))}
    </div>
    <button onClick={() => onNavigate('weaver')}
      className="w-full py-1.5 text-[9px] font-bold uppercase tracking-wider bg-imperial-purple/20 hover:bg-imperial-purple/30 border border-imperial-purple/30 rounded-lg text-imperial-purple transition-all">
      Open in Weaver Studio →
    </button>
  </div>
);
