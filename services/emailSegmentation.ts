/**
 * Segmentation engine: rule evaluation against derived personas.
 * See docs/email-marketing/segmentation-algorithms.md for rationale.
 */

import type { CRMContact, CRMActivity } from '../types.js';
import type { EmailPersona, EmailSegmentDefinition, ScoredContact, SegmentEvaluationResult, SegmentRule } from './emailCampaignTypes.js';
import { deriveEmailPersona } from './emailPersona.js';

function ruleValue(persona: EmailPersona, contact: CRMContact, field: SegmentRule['field']): string | number {
  switch (field) {
    case 'company':
      return contact.company || '';
    case 'role':
      return contact.role || '';
    case 'region':
      return persona.region;
    case 'seniority':
      return persona.seniority;
    case 'lifecycle':
      return persona.lifecycle;
    case 'engagementScore':
      return persona.engagementScore;
    default:
      return '';
  }
}

export function evaluateRule(rule: SegmentRule, persona: EmailPersona, contact: CRMContact): boolean {
  const raw = ruleValue(persona, contact, rule.field);
  const left = typeof raw === 'number' ? raw : String(raw).toLowerCase();
  const val = rule.value.trim().toLowerCase();

  if (rule.field === 'engagementScore') {
    const n = Number(rule.value);
    if (Number.isNaN(n)) return false;
    if (rule.op === 'gte') return persona.engagementScore >= n;
    if (rule.op === 'lte') return persona.engagementScore <= n;
    if (rule.op === 'equals') return persona.engagementScore === n;
    return false;
  }

  const s = String(left);
  if (rule.op === 'contains') return s.includes(val);
  if (rule.op === 'equals') return s === val;
  if (rule.op === 'gte' || rule.op === 'lte') {
    const n = Number(rule.value);
    if (Number.isNaN(n)) return false;
    const numLeft = Number(s);
    if (!Number.isNaN(numLeft)) {
      if (rule.op === 'gte') return numLeft >= n;
      return numLeft <= n;
    }
    return false;
  }
  return false;
}

export function evaluateSegment(
  segment: EmailSegmentDefinition,
  contacts: CRMContact[],
  activities: CRMActivity[],
): SegmentEvaluationResult {
  const scored: ScoredContact[] = contacts.map((contact) => {
    const persona = deriveEmailPersona(contact, activities);
    const combiner = segment.matchAny ? 'some' : 'every';
    const match =
      segment.rules.length === 0
        ? true
        : segment.rules[combiner]((r) => evaluateRule(r, persona, contact));
    return { contact, persona, match };
  });

  return {
    segment,
    contacts: scored,
    count: scored.filter((s) => s.match).length,
    evaluatedAt: Date.now(),
  };
}
