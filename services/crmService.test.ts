import { describe, expect, test } from 'bun:test';
import {
  buildInfluenceLinks,
  groupDealsByStage,
  parseCrmRealtimeSlice,
  getCrmRealtimeChannels,
  mapDBToDeal,
  mapDBToContact,
  CRM_PIPELINE_STAGES,
} from './crmService.js';
import type { CRMContact, TableCRMDeal } from '../types.js';

describe('crmService', () => {
  test('groupDealsByStage buckets rows by stage', () => {
    const rows: TableCRMDeal[] = [
      {
        $id: 'd1',
        syndicate_id: 'syn-1',
        company: 'Acme',
        deal_name: 'Expansion',
        priority: 'High',
        value: 10000,
        stage: 'Negotiation',
        last_contact: '2026-05-01',
        resonance: 70,
      },
      {
        $id: 'd2',
        syndicate_id: 'syn-1',
        company: 'Beta',
        deal_name: 'Pilot',
        priority: 'Low',
        value: 2000,
        stage: 'Unknown',
        last_contact: '2026-05-02',
        resonance: 40,
      },
    ];

    const pipeline = groupDealsByStage(rows);
    expect(pipeline.Negotiation).toHaveLength(1);
    expect(pipeline.Negotiation[0].dealName).toBe('Expansion');
    expect(pipeline.Prospecting).toHaveLength(1);
    expect(pipeline.Prospecting[0].company).toBe('Beta');
  });

  test('mapDBToDeal parses strategy_json', () => {
    const deal = mapDBToDeal({
      $id: 'd1',
      syndicate_id: 'syn-1',
      company: 'Acme',
      deal_name: 'Deal',
      priority: 'Medium',
      value: 5000,
      stage: 'Proposal',
      last_contact: '2026-05-01',
      resonance: 55,
      strategy_json: JSON.stringify({
        gambit: 'Close fast',
        tactics: ['Call CFO'],
        riskScore: 12,
        resonance: 80,
      }),
    });
    expect(deal.strategy?.gambit).toBe('Close fast');
    expect(deal.resonance).toBe(55);
  });

  test('buildInfluenceLinks links contacts at same company only', () => {
    const contacts: CRMContact[] = [
      { id: 'a', name: 'A', role: 'CEO', company: 'Acme', syndicateId: 's' },
      { id: 'b', name: 'B', role: 'CTO', company: 'Acme', syndicateId: 's' },
      { id: 'c', name: 'C', role: 'VP', company: 'Other', syndicateId: 's' },
    ];
    const links = buildInfluenceLinks(contacts);
    expect(links).toHaveLength(1);
    expect(links[0].sourceId).toBe('a');
    expect(links[0].targetId).toBe('b');
  });

  test('parseCrmRealtimeSlice maps events to table slice', () => {
    expect(parseCrmRealtimeSlice(['databases.sovereign.collections.crm_deals.documents.create'])).toBe(
      'deals',
    );
    expect(
      parseCrmRealtimeSlice(['databases.sovereign.collections.crm_activities.documents.update']),
    ).toBe('activities');
    expect(parseCrmRealtimeSlice(['databases.sovereign.collections.crm_contacts.documents.delete'])).toBe(
      'contacts',
    );
    expect(parseCrmRealtimeSlice(['databases.sovereign.collections.agents.documents.create'])).toBeNull();
  });

  test('getCrmRealtimeChannels lists CRM tables only', () => {
    const channels = getCrmRealtimeChannels();
    expect(channels).toHaveLength(3);
    expect(channels.every((c) => c.includes('crm_'))).toBe(true);
    expect(channels.some((c) => c.includes('crm_deals'))).toBe(true);
  });

  test('mapDBToContact maps syndicate id', () => {
    const contact = mapDBToContact({
      $id: 'c1',
      syndicate_id: 'syn-9',
      name: 'Pat',
      role: 'Buyer',
      company: 'Acme',
      email: 'pat@acme.test',
      last_contact: '2026-05-10',
    });
    expect(contact.syndicateId).toBe('syn-9');
    expect(contact.email).toBe('pat@acme.test');
  });

  test('CRM_PIPELINE_STAGES matches kanban columns', () => {
    expect(CRM_PIPELINE_STAGES).toEqual([
      'Prospecting',
      'Qualification',
      'Proposal',
      'Negotiation',
      'Won',
      'Lost',
    ]);
  });
});
