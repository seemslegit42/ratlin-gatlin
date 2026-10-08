/**
 * Domain types for the Growth Engine email marketing module.
 * Kept separate from global `types.ts` to isolate CRM email concerns.
 */

import type { CRMContact, CRMActivity } from '../types.js';

export type EmailBlockType = 'hero' | 'text' | 'button' | 'image' | 'columns' | 'spacer' | 'divider';

export interface EmailBlockBase {
  id: string;
  type: EmailBlockType;
}

export interface EmailHeroBlock extends EmailBlockBase {
  type: 'hero';
  headline: string;
  subline: string;
  align: 'left' | 'center';
}

export interface EmailTextBlock extends EmailBlockBase {
  type: 'text';
  body: string;
  align: 'left' | 'center';
}

export interface EmailButtonBlock extends EmailBlockBase {
  type: 'button';
  label: string;
  href: string;
}

export interface EmailImageBlock extends EmailBlockBase {
  type: 'image';
  alt: string;
  src: string;
}

export interface EmailColumnsBlock extends EmailBlockBase {
  type: 'columns';
  left: string;
  right: string;
}

export interface EmailSpacerBlock extends EmailBlockBase {
  type: 'spacer';
  heightPx: number;
}

export interface EmailDividerBlock extends EmailBlockBase {
  type: 'divider';
}

export type EmailBlock =
  | EmailHeroBlock
  | EmailTextBlock
  | EmailButtonBlock
  | EmailImageBlock
  | EmailColumnsBlock
  | EmailSpacerBlock
  | EmailDividerBlock;

export type EmailLayoutPreset = 'narrow' | 'standard' | 'wide';

export interface EmailTemplateDocument {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  layout: EmailLayoutPreset;
  blocks: EmailBlock[];
  updatedAt: number;
}

export type SegmentRuleField =
  | 'company'
  | 'role'
  | 'region'
  | 'seniority'
  | 'lifecycle'
  | 'engagementScore';

export type SegmentRuleOp = 'contains' | 'equals' | 'gte' | 'lte';

export interface SegmentRule {
  id: string;
  field: SegmentRuleField;
  op: SegmentRuleOp;
  value: string;
}

export interface EmailSegmentDefinition {
  id: string;
  name: string;
  dynamic: boolean;
  rules: SegmentRule[];
  /** When true, rules are combined with OR instead of AND */
  matchAny: boolean;
}

export type ScheduleMode = 'once' | 'recurring';

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export type SendTimeOptimizationMode = 'off' | 'engagement' | 'timezone';

export interface CampaignScheduleConfig {
  id: string;
  campaignName: string;
  segmentId: string | null;
  templateId: string | null;
  mode: ScheduleMode;
  /** ISO local datetime string from `<input type="datetime-local" />` */
  startLocal: string;
  /** IANA time zone for interpreting startLocal and recurring anchors */
  timeZone: string;
  recurring: RecurrencePattern | null;
  /** 0–6 Sun–Sat when recurring === 'weekly' */
  dayOfWeek: number | null;
  sto: SendTimeOptimizationMode;
  enabled: boolean;
}

export interface EmailPersona {
  contactId: string;
  region: 'AMER' | 'EMEA' | 'APAC' | 'LATAM' | 'Unknown';
  seniority: 'IC' | 'Lead' | 'Director' | 'VP' | 'C-Level' | 'Unknown';
  engagementScore: number;
  lifecycle: 'cold' | 'warm' | 'active' | 'advocate' | 'dormant';
  daysSinceContact: number;
}

export interface ScoredContact {
  contact: CRMContact;
  persona: EmailPersona;
  match: boolean;
}

export interface SegmentEvaluationResult {
  segment: EmailSegmentDefinition;
  contacts: ScoredContact[];
  count: number;
  evaluatedAt: number;
}

export interface ScheduleOccurrence {
  instant: Date;
  label: string;
  stoAdjusted: boolean;
}

export interface CampaignPerformanceSnapshot {
  campaignId: string;
  sends: number;
  delivered: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  openRate: number;
  clickRate: number;
  /** Heuristic confidence 0–1 for synthetic projections */
  confidence: number;
}
