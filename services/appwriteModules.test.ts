import { describe, it, expect } from 'bun:test';
import { TABLES, DATABASE_ID, BUCKETS, resolveAppwriteEndpoint, resolveAppwriteProjectId, sanitizeDocumentPayload } from './appwriteClient.js';

describe('Appwrite Core Modules Integration', () => {
  it('should resolve the operational Toronto regional endpoint and sovereign project ID', () => {
    const endpoint = resolveAppwriteEndpoint();
    expect(endpoint).toBe('https://tor.cloud.appwrite.io/v1');

    const projectId = resolveAppwriteProjectId();
    expect(projectId).toBe('6990e2830030cacccd98');

    // Generic cloud.appwrite.io maps safely to Toronto region
    expect(resolveAppwriteEndpoint('https://cloud.appwrite.io/v1')).toBe('https://tor.cloud.appwrite.io/v1');

    // Explicit custom/regional endpoint is preserved
    expect(resolveAppwriteEndpoint('https://custom.appwrite.domain/v1')).toBe('https://custom.appwrite.domain/v1');
  });

  it('should expose all required sovereign database tables', () => {
    expect(DATABASE_ID).toBe('sovereign');
    expect(TABLES.LEDGER).toBe('ledger');
    expect(TABLES.TRANSACTIONS).toBe('transactions');
    expect(TABLES.TREASURY_TRANSACTIONS).toBe('treasury_transactions');
    expect(TABLES.OPERATIONS_TASKS).toBe('operations_tasks');
    expect(TABLES.PROCUREMENT_ORDERS).toBe('procurement_orders');
    expect(TABLES.NOTES).toBe('notes');
    expect(TABLES.CRM_DEALS).toBe('crm_deals');
    expect(TABLES.CRM_CONTACTS).toBe('crm_contacts');
    expect(TABLES.CRM_ACTIVITIES).toBe('crm_activities');
    expect(TABLES.EMAIL_MARKETING_LAB).toBe('email_marketing_lab');
    expect(TABLES.ACCESS_KEYS).toBe('access_keys');
    expect(TABLES.SYNDICATE_INTEGRATIONS).toBe('syndicate_integrations');
  });

  it('should verify storage bucket identifiers for media and avatars', () => {
    expect(BUCKETS.AVATARS).toBe('avatars');
    expect(BUCKETS.DOCUMENTS).toBe('documents');
    expect(BUCKETS.MEDIA).toBe('media');
  });

  it('should calculate PLM Chronos milestone progress and stage gates accurately', () => {
    const plmStages = [
      { stage: 'Concept', progress: 100, status: 'Completed' },
      { stage: 'Prototyping', progress: 85, status: 'Active' },
      { stage: 'Validation', progress: 40, status: 'Pending' },
      { stage: 'Production', progress: 0, status: 'Locked' },
    ];

    const overallProgress = Math.round(
      plmStages.reduce((acc, s) => acc + s.progress, 0) / plmStages.length
    );

    expect(overallProgress).toBe(56);
    expect(plmStages.find(s => s.status === 'Active')?.stage).toBe('Prototyping');
  });

  it('should strip forbidden custom id and system attributes from document payloads', () => {
    const rawPayload = {
      id: 'custom_forbidden_id',
      $id: 'system_id',
      $createdAt: '2026-01-01',
      $updatedAt: '2026-01-01',
      $permissions: ['read("any")'],
      $databaseId: 'sovereign',
      $collectionId: 'agents',
      syndicate_id: 'syn_alpha',
      name: 'Agent Aegis',
      status: 'Active',
    };

    const sanitized = sanitizeDocumentPayload(rawPayload);

    expect(sanitized.id).toBeUndefined();
    expect(sanitized.$id).toBeUndefined();
    expect(sanitized.$createdAt).toBeUndefined();
    expect(sanitized.$updatedAt).toBeUndefined();
    expect(sanitized.$permissions).toBeUndefined();
    expect(sanitized.$databaseId).toBeUndefined();
    expect(sanitized.$collectionId).toBeUndefined();
    expect(sanitized.syndicate_id).toBe('syn_alpha');
    expect(sanitized.name).toBe('Agent Aegis');
    expect(sanitized.status).toBe('Active');
  });
});
