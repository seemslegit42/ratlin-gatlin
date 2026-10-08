/**
 * Dynamic segmentation UI backed by CRM contacts + derived personas.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';
import { ModuleCard } from '../../../modules/shared/ModuleCard.js';
import { BrainIcon } from '../../icons/BrainIcon.js';
import type { CRMContact, CRMActivity } from '../../../types.js';
import type { EmailSegmentDefinition, SegmentRule, SegmentRuleField, SegmentRuleOp } from '../../../services/emailCampaignTypes.js';
import { evaluateSegment } from '../../../services/emailSegmentation.js';

const FIELDS: { id: SegmentRuleField; label: string }[] = [
  { id: 'company', label: 'Company' },
  { id: 'role', label: 'Role' },
  { id: 'region', label: 'Region (derived)' },
  { id: 'seniority', label: 'Seniority (derived)' },
  { id: 'lifecycle', label: 'Lifecycle (derived)' },
  { id: 'engagementScore', label: 'Engagement score' },
];

const OPS_TEXT: { id: SegmentRuleOp; label: string }[] = [
  { id: 'contains', label: 'contains' },
  { id: 'equals', label: 'equals' },
];

const OPS_NUM: { id: SegmentRuleOp; label: string }[] = [
  { id: 'gte', label: '≥' },
  { id: 'lte', label: '≤' },
  { id: 'equals', label: '=' },
];

function emptySegment(): EmailSegmentDefinition {
  return {
    id: nanoid(),
    name: 'New dynamic segment',
    dynamic: true,
    rules: [],
    matchAny: false,
  };
}

export interface SegmentationWorkbenchProps {
  segments: EmailSegmentDefinition[];
  onSegmentsChange: (next: EmailSegmentDefinition[] | ((prev: EmailSegmentDefinition[]) => EmailSegmentDefinition[])) => void;
  contacts: CRMContact[];
  activities: CRMActivity[];
}

export const SegmentationWorkbench: React.FC<SegmentationWorkbenchProps> = ({ segments, onSegmentsChange: setSegments, contacts, activities }) => {
  const [activeId, setActiveId] = useState(segments[0]?.id ?? '');

  useEffect(() => {
    if (segments.length === 0) {
      setActiveId('');
      return;
    }
    if (!segments.some((s) => s.id === activeId)) {
      setActiveId(segments[0]!.id);
    }
  }, [segments, activeId]);

  const active = segments.find((s) => s.id === activeId) ?? segments[0];
  const evaluation = useMemo(() => {
    if (!active) return null;
    return evaluateSegment(active, contacts, activities);
  }, [active, contacts, activities]);

  const upsert = (next: EmailSegmentDefinition) => {
    setSegments((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  };

  const addSegment = () => {
    const s = emptySegment();
    setSegments((prev) => [...prev, s]);
    setActiveId(s.id);
  };

  const addRule = () => {
    if (!active) return;
    const rule: SegmentRule = {
      id: nanoid(),
      field: 'lifecycle',
      op: 'equals',
      value: 'active',
    };
    upsert({ ...active, rules: [...active.rules, rule] });
  };

  const updateRule = (ruleId: string, patch: Partial<SegmentRule>) => {
    if (!active) return;
    upsert({
      ...active,
      rules: active.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)),
    });
  };

  const removeRule = (ruleId: string) => {
    if (!active) return;
    upsert({ ...active, rules: active.rules.filter((r) => r.id !== ruleId) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ModuleCard title="Segment definitions" icon={<BrainIcon className="w-5 h-5 text-imperial-purple" />}>
        <div className="flex flex-wrap gap-2 mb-3">
          {segments.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${
                s.id === active?.id ? 'border-imperial-purple bg-imperial-purple/15 text-white' : 'border-white/10 text-text-secondary'
              }`}
            >
              {s.name.slice(0, 18)}
              {s.dynamic ? ' · live' : ''}
            </button>
          ))}
          <button type="button" onClick={addSegment} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-dashed border-white/20 text-text-tertiary hover:text-white">
            + Segment
          </button>
        </div>

        {active && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Name</label>
              <input
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                value={active.name}
                onChange={(e) => upsert({ ...active, name: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={active.dynamic}
                onChange={(e) => upsert({ ...active, dynamic: e.target.checked })}
                className="rounded border-white/20"
              />
              Dynamic segment (re-evaluate on CRM refresh)
            </label>
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={active.matchAny}
                onChange={(e) => upsert({ ...active, matchAny: e.target.checked })}
                className="rounded border-white/20"
              />
              Match any rule (OR). Off = all rules (AND).
            </label>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold text-text-tertiary uppercase">Rules</span>
              <button type="button" onClick={addRule} className="text-[10px] font-bold uppercase text-roman-aqua hover:underline">
                + Rule
              </button>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {active.rules.length === 0 && <p className="text-xs text-text-tertiary">No rules — entire CRM list matches.</p>}
              {active.rules.map((r) => (
                <motion.div
                  layout
                  key={r.id}
                  className="p-3 rounded-lg border border-white/10 bg-black/30 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="bg-black/50 border border-white/10 rounded text-[10px] text-white p-2"
                      value={r.field}
                      onChange={(e) => updateRule(r.id, { field: e.target.value as SegmentRuleField })}
                    >
                      {FIELDS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="bg-black/50 border border-white/10 rounded text-[10px] text-white p-2"
                      value={r.op}
                      onChange={(e) => updateRule(r.id, { op: e.target.value as SegmentRuleOp })}
                    >
                      {(r.field === 'engagementScore' ? OPS_NUM : OPS_TEXT).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                    value={r.value}
                    onChange={(e) => updateRule(r.id, { value: e.target.value })}
                    placeholder={r.field === 'engagementScore' ? 'e.g. 40' : 'value'}
                  />
                  <button type="button" onClick={() => removeRule(r.id)} className="text-[10px] text-red-400 font-bold uppercase">
                    Remove rule
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </ModuleCard>

      <ModuleCard title="Live audience match" icon={<BrainIcon className="w-5 h-5 text-roman-aqua" />}>
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-xs text-text-secondary">
            CRM contacts loaded: <span className="text-white font-mono">{contacts.length}</span>
          </p>
          {evaluation && (
            <p className="text-xs">
              Matched:{' '}
              <span className="text-patina-green font-mono font-bold">{evaluation.count}</span>
            </p>
          )}
        </div>
        <p className="text-[10px] text-text-tertiary mb-3">
          Personas blend deterministic CRM signals with activity density. See docs/email-marketing/segmentation-algorithms.md.
        </p>
        <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {evaluation?.contacts
            .filter((c) => c.match)
            .map((row) => (
              <div key={row.contact.id} className="p-2 rounded-lg border border-white/5 bg-white/5 text-[10px]">
                <div className="font-bold text-white text-xs">{row.contact.name}</div>
                <div className="text-text-tertiary mt-0.5">
                  {row.contact.company} · {row.contact.role}
                </div>
                <div className="mt-1 font-mono text-text-secondary">
                  {row.persona.lifecycle} · score {row.persona.engagementScore} · {row.persona.region} · last touch {row.persona.daysSinceContact}d
                </div>
              </div>
            ))}
          {evaluation && evaluation.count === 0 && <p className="text-xs text-text-tertiary">No contacts match these rules.</p>}
        </div>
      </ModuleCard>
    </div>
  );
};
