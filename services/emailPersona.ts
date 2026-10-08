/**
 * Derives lightweight marketing personas from CRM contacts and activity history.
 * Deterministic so previews and segmentation stay stable across reloads.
 */

import type { CRMContact, CRMActivity } from '../types.js';
import type { EmailPersona } from './emailCampaignTypes.js';

function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(seed: number, options: readonly T[]): T {
  return options[seed % options.length]!;
}

export function countRelevantActivities(contact: CRMContact, activities: CRMActivity[]): number {
  const needle = contact.name.trim().toLowerCase();
  if (!needle) return 0;
  return activities.filter((a) => {
    const t = `${a.target} ${a.topic}`.toLowerCase();
    return t.includes(needle);
  }).length;
}

export function deriveEmailPersona(contact: CRMContact, activities: CRMActivity[] = []): EmailPersona {
  const base = stableHash(`${contact.id}|${contact.email ?? ''}|${contact.company}`);
  const role = (contact.role || '').toLowerCase();
  const engagementEvents = countRelevantActivities(contact, activities);
  const rawScore = Math.min(100, engagementEvents * 12 + (base % 18));

  let seniority: EmailPersona['seniority'] = 'IC';
  if (/(chief|ceo|cfo|cto|coo|founder|president)/i.test(role)) seniority = 'C-Level';
  else if (/(vp|vice president)/i.test(role)) seniority = 'VP';
  else if (/(director|head of)/i.test(role)) seniority = 'Director';
  else if (/(lead|principal|staff)/i.test(role)) seniority = 'Lead';

  const region = pick(base, ['AMER', 'EMEA', 'APAC', 'LATAM', 'Unknown'] as const);

  const last = contact.lastContact ? Date.parse(contact.lastContact) : NaN;
  const daysSinceContact = Number.isFinite(last)
    ? Math.max(0, Math.round((Date.now() - last) / 86400000))
    : 60 + (base % 120);

  let lifecycle: EmailPersona['lifecycle'] = 'warm';
  if (rawScore >= 72) lifecycle = 'advocate';
  else if (rawScore >= 45) lifecycle = 'active';
  else if (rawScore >= 22) lifecycle = 'warm';
  else if (daysSinceContact > 90) lifecycle = 'dormant';
  else lifecycle = 'cold';

  return {
    contactId: contact.id,
    region,
    seniority,
    engagementScore: rawScore,
    lifecycle,
    daysSinceContact,
  };
}
