/**
 * Campaign scheduling: one-time / recurring, time zones, STO, and performance readouts.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { ModuleCard } from '../../../modules/shared/ModuleCard.js';
import { ZapIcon } from '../../icons/VitalsIcons.js';
import type { CampaignScheduleConfig, EmailSegmentDefinition, EmailTemplateDocument } from '../../../services/emailCampaignTypes.js';
import { expandScheduleOccurrences, syntheticPerformanceSnapshot } from '../../../services/emailScheduler.js';

const ZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];

function defaultSchedule(): CampaignScheduleConfig {
  const start = new Date(Date.now() + 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}`;
  return {
    id: nanoid(),
    campaignName: 'Lifecycle pulse',
    segmentId: null,
    templateId: null,
    mode: 'once',
    startLocal: local,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    recurring: 'weekly',
    dayOfWeek: 2,
    sto: 'engagement',
    enabled: true,
  };
}

export interface ScheduleHubProps {
  schedules: CampaignScheduleConfig[];
  onSchedulesChange: (next: CampaignScheduleConfig[] | ((prev: CampaignScheduleConfig[]) => CampaignScheduleConfig[])) => void;
  segments: EmailSegmentDefinition[];
  templates: EmailTemplateDocument[];
}

export const ScheduleHub: React.FC<ScheduleHubProps> = ({ schedules, onSchedulesChange: setSchedules, segments, templates }) => {
  const [activeId, setActiveId] = useState(schedules[0]?.id ?? '');

  useEffect(() => {
    if (schedules.length === 0) {
      setActiveId('');
      return;
    }
    if (!schedules.some((s) => s.id === activeId)) {
      setActiveId(schedules[0]!.id);
    }
  }, [schedules, activeId]);

  const active = schedules.find((s) => s.id === activeId) ?? schedules[0];

  const occurrences = useMemo(() => (active ? expandScheduleOccurrences(active, 6) : []), [active]);
  const perf = useMemo(() => (active ? syntheticPerformanceSnapshot(active) : null), [active]);

  const upsert = (cfg: CampaignScheduleConfig) => {
    setSchedules((prev) => prev.map((s) => (s.id === cfg.id ? cfg : s)));
  };

  const addSchedule = () => {
    const s = defaultSchedule();
    setSchedules((prev) => [...prev, s]);
    setActiveId(s.id);
  };

  if (!active) {
    return (
      <ModuleCard title="Schedule hub">
        <button type="button" onClick={addSchedule} className="text-xs text-roman-aqua font-bold uppercase">
          Create schedule
        </button>
      </ModuleCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ModuleCard title="Schedules" icon={<ZapIcon className="w-5 h-5 text-patina-green" />}>
        <div className="flex flex-wrap gap-2 mb-4">
          {schedules.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${
                s.id === active.id ? 'border-patina-green bg-patina-green/10 text-white' : 'border-white/10 text-text-secondary'
              }`}
            >
              {s.campaignName.slice(0, 16)}
            </button>
          ))}
          <button type="button" onClick={addSchedule} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-dashed border-white/20 text-text-tertiary">
            + Campaign
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Campaign name</label>
            <input
              className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              value={active.campaignName}
              onChange={(e) => upsert({ ...active, campaignName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Segment</label>
              <select
                className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
                value={active.segmentId ?? ''}
                onChange={(e) => upsert({ ...active, segmentId: e.target.value || null })}
              >
                <option value="">All contacts</option>
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {seg.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Template</label>
              <select
                className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
                value={active.templateId ?? ''}
                onChange={(e) => upsert({ ...active, templateId: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Mode</label>
              <select
                className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
                value={active.mode}
                onChange={(e) => upsert({ ...active, mode: e.target.value as CampaignScheduleConfig['mode'] })}
              >
                <option value="once">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            {active.mode === 'recurring' && (
              <div>
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Cadence</label>
                <select
                  className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
                  value={active.recurring ?? 'weekly'}
                  onChange={(e) => upsert({ ...active, recurring: e.target.value as CampaignScheduleConfig['recurring'] })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Start (local)</label>
            <input
              type="datetime-local"
              className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              value={active.startLocal}
              onChange={(e) => upsert({ ...active, startLocal: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Time zone</label>
            <select
              className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
              value={active.timeZone}
              onChange={(e) => upsert({ ...active, timeZone: e.target.value })}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Send-time optimization</label>
            <select
              className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
              value={active.sto}
              onChange={(e) => upsert({ ...active, sto: e.target.value as CampaignScheduleConfig['sto'] })}
            >
              <option value="off">Off (honor scheduled instant)</option>
              <option value="engagement">Engagement window (UTC afternoon)</option>
              <option value="timezone">Regional morning anchor</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input type="checkbox" checked={active.enabled} onChange={(e) => upsert({ ...active, enabled: e.target.checked })} />
            Enabled for orchestration
          </label>
        </div>
      </ModuleCard>

      <ModuleCard title="Projected sends & analytics">
        <p className="text-[10px] text-text-tertiary mb-3">
          Occurrence list applies time zone + STO heuristics. Performance panel uses deterministic projections until ESP webhooks land — see docs/email-marketing/scheduling-architecture.md.
        </p>
        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
          {occurrences.map((o, i) => (
            <div key={i} className="flex justify-between text-[11px] border-b border-white/5 pb-2">
              <span className="text-text-secondary">{o.label}</span>
              {o.stoAdjusted && <span className="text-roman-aqua font-mono text-[10px] uppercase">STO</span>}
            </div>
          ))}
        </div>

        {perf && (
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <Stat label="Sends" value={perf.sends.toLocaleString()} />
            <Stat label="Delivered" value={perf.delivered.toLocaleString()} />
            <Stat label="Open rate" value={`${(perf.openRate * 100).toFixed(1)}%`} />
            <Stat label="Click rate" value={`${(perf.clickRate * 100).toFixed(1)}%`} />
            <Stat label="Unsubs" value={String(perf.unsubscribes)} />
            <Stat label="Model confidence" value={`${(perf.confidence * 100).toFixed(0)}%`} />
          </div>
        )}
      </ModuleCard>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-black/30 border border-white/10">
    <div className="text-[9px] uppercase tracking-widest text-text-tertiary">{label}</div>
    <div className="text-sm font-mono text-white mt-1">{value}</div>
  </div>
);
