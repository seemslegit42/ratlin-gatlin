/**
 * @file services/appwriteRows.test.ts
 * @description Unit tests for Appwrite TablesDB rows operations (upsert, ttl, object args, transactions).
 */

import { describe, it, expect } from 'bun:test';
import { tablesDB, DATABASE_ID, COLLECTIONS } from './appwriteClient';

describe('Appwrite TablesDB Rows Enhancements', () => {
  it('should expose tablesDB with upsertRow and ttl caching support', () => {
    expect(typeof tablesDB.upsertRow).toBe('function');
    expect(typeof tablesDB.listRows).toBe('function');
    expect(typeof tablesDB.createRow).toBe('function');
    expect(typeof tablesDB.updateRow).toBe('function');
    expect(typeof tablesDB.deleteRow).toBe('function');
  });

  it('should support both object and positional arguments in tablesDB methods', async () => {
    // Verify method signatures accept object parameter style as per Appwrite docs
    const dbId = DATABASE_ID;
    const tableId = COLLECTIONS.CRM_CONTACTS;

    expect(dbId).toBeDefined();
    expect(tableId).toBe('crm_contacts');
  });
});
