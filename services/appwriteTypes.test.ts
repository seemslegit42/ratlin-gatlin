import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

describe('Appwrite Type Generation & Schema Sync', () => {
  const rootDir = process.cwd();
  const appwriteJsonPath = path.join(rootDir, 'appwrite.json');
  const appwriteConfigJsonPath = path.join(rootDir, 'appwrite.config.json');

  it('should have all 37 sovereign tables defined in appwrite.config.json tables array', () => {
    const configRaw = fs.readFileSync(appwriteConfigJsonPath, 'utf8');
    const config = JSON.parse(configRaw);

    expect(Array.isArray(config.tables)).toBe(true);
    expect(config.tables.length).toBeGreaterThanOrEqual(37);

    const tableIds = config.tables.map((t: { $id: string }) => t.$id);
    expect(tableIds).toContain('ledger');
    expect(tableIds).toContain('agents');
    expect(tableIds).toContain('users');
    expect(tableIds).toContain('crm_contacts');
    expect(tableIds).toContain('crm_deals');
    expect(tableIds).toContain('treasury_transactions');
    expect(tableIds).toContain('email_marketing_lab');
    expect(tableIds).toContain('micro_app_modules');
  });

  it('should have valid column definitions compatible with Appwrite CLI for each table', () => {
    const configRaw = fs.readFileSync(appwriteConfigJsonPath, 'utf8');
    const config = JSON.parse(configRaw);

    for (const table of config.tables) {
      expect(table.$id).toBeDefined();
      expect(table.name).toBeDefined();
      expect(table.databaseId).toBe('sovereign');
      expect(Array.isArray(table.columns)).toBe(true);
      expect(table.columns.length).toBeGreaterThan(0);

      for (const col of table.columns) {
        expect(col.key).toBeDefined();
        expect(col.type).toBeDefined();
        expect(typeof col.required).toBe('boolean');
        expect(typeof col.array).toBe('boolean');
      }
    }
  });

  it('should have appwrite.json synced with the tables database schema', () => {
    const appwriteRaw = fs.readFileSync(appwriteJsonPath, 'utf8');
    const appwrite = JSON.parse(appwriteRaw);

    expect(Array.isArray(appwrite.tables)).toBe(true);
    expect(appwrite.tables.length).toBeGreaterThanOrEqual(37);
  });

  it('should generate valid TypeScript types in types/appwrite/appwrite.d.ts', () => {
    const typeDefPath = path.join(rootDir, 'types/appwrite/appwrite.d.ts');
    expect(fs.existsSync(typeDefPath)).toBe(true);

    const content = fs.readFileSync(typeDefPath, 'utf8');
    expect(content).toContain("import type { Models } from 'appwrite'");
    expect(content).toContain('export type Ledger = Models.Row &');
    expect(content).toContain('export type Agents = Models.Row &');
    expect(content).toContain('export type Users = Models.Row &');
    expect(content).toContain('export type CrmContacts = Models.Row &');
    expect(content).toContain('export type CrmDeals = Models.Row &');
    expect(content).toContain('export type TreasuryTransactions = Models.Row &');
  });

  it('should export types cleanly via types/appwrite/index.ts', () => {
    const indexPath = path.join(rootDir, 'types/appwrite/index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);

    const indexContent = fs.readFileSync(indexPath, 'utf8');
    expect(indexContent).toContain("export * from './appwrite.d'");
    expect(indexContent).toContain('SOVEREIGN_TABLE_IDS');
  });
});
