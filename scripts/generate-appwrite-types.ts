#!/usr/bin/env bun
/**
 * @file scripts/generate-appwrite-types.ts
 * @description Syncs the Sovereign TablesDB database schema into appwrite.json & appwrite.config.json,
 * then generates strongly-typed TypeScript models using Appwrite CLI (or deterministic zero-dep generator).
 *
 * Usage:
 *   bun run scripts/generate-appwrite-types.ts [--language ts] [--strict] [--output ./types/appwrite]
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TABLES_SCHEMA, DATABASE_ID, type ColumnSpec } from './appwrite-schema';

type CliColumn = {
  key: string;
  type: string;
  size?: number;
  required: boolean;
  array: boolean;
  format?: string;
  default?: any;
};

type CliTable = {
  $id: string;
  databaseId: string;
  name: string;
  enabled: boolean;
  rowSecurity: boolean;
  $permissions: string[];
  columns: CliColumn[];
  indexes: Array<{ key: string; type: string; attributes: string[] }>;
};

function mapColumnToCli(col: ColumnSpec): CliColumn {
  const isArray = Boolean(col.array);
  const isRequired = col.required ?? (col.key === 'syndicate_id' ? true : false);

  let colType = 'varchar';
  let size = col.size || 255;
  let format: string | undefined = undefined;

  switch (col.type) {
    case 'string':
      if (col.size && col.size > 255) {
        colType = 'text';
      } else {
        colType = 'varchar';
      }
      break;
    case 'varchar':
    case 'text':
    case 'mediumtext':
    case 'longtext':
      colType = col.type;
      break;
    case 'url':
      colType = 'url';
      size = 2048;
      break;
    case 'email':
      colType = 'email';
      size = 255;
      break;
    case 'ip':
      colType = 'ip';
      break;
    case 'float':
      colType = 'double';
      break;
    case 'integer':
      colType = 'integer';
      break;
    case 'bigint':
      colType = 'bigint';
      break;
    case 'boolean':
      colType = 'boolean';
      break;
    case 'datetime':
      colType = 'datetime';
      break;
    case 'enum':
      colType = 'enum';
      break;
    case 'point':
    case 'line':
    case 'polygon':
    case 'relationship':
      colType = col.type;
      break;
    default:
      colType = 'varchar';
  }

  const result: CliColumn = {
    key: col.key,
    type: colType,
    required: isRequired,
    array: isArray,
  };

  if (colType === 'varchar' || colType === 'text') {
    result.size = size;
  }
  if (col.elements) {
    (result as any).elements = col.elements;
  }
  if (col.relatedTableId) {
    (result as any).relatedTableId = col.relatedTableId;
    (result as any).relationType = col.relationType;
    (result as any).twoWay = col.twoWay;
    (result as any).twoWayKey = col.twoWayKey;
    (result as any).onDelete = col.onDelete;
  }
  if (format) {
    result.format = format;
  }

  return result;
}

export function buildSovereignTables(): CliTable[] {
  const tables: CliTable[] = [];

  for (const [tableId, spec] of Object.entries(TABLES_SCHEMA)) {
    const columns: CliColumn[] = spec.columns.map(mapColumnToCli);

    // Ensure syndicate_id index exists if table has syndicate_id
    const hasSyndicateId = spec.columns.some((c) => c.key === 'syndicate_id');
    const indexes: Array<{ key: string; type: string; attributes: string[] }> = [];
    if (hasSyndicateId) {
      indexes.push({
        key: 'syndicate_id',
        type: 'key',
        attributes: ['syndicate_id'],
      });
    }

    tables.push({
      $id: tableId,
      databaseId: DATABASE_ID,
      name: spec.name,
      enabled: true,
      rowSecurity: false,
      $permissions: [],
      columns,
      indexes,
    });
  }

  return tables;
}

export function syncConfigFiles(rootDir: string, tables: CliTable[]): void {
  const appwriteConfigPath = path.join(rootDir, 'appwrite.config.json');
  const appwriteJsonPath = path.join(rootDir, 'appwrite.json');

  // 1. Sync appwrite.config.json
  if (fs.existsSync(appwriteConfigPath)) {
    const configRaw = fs.readFileSync(appwriteConfigPath, 'utf8');
    const config = JSON.parse(configRaw);

    config.tablesDB = [
      {
        $id: DATABASE_ID,
        name: 'Sovereign',
        enabled: true,
      },
    ];
    config.tables = tables;

    fs.writeFileSync(appwriteConfigPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
    console.log(`[sync] Synchronized ${tables.length} tables to appwrite.config.json`);
  }

  // 2. Sync appwrite.json
  if (fs.existsSync(appwriteJsonPath)) {
    const appwriteRaw = fs.readFileSync(appwriteJsonPath, 'utf8');
    const appwrite = JSON.parse(appwriteRaw);

    appwrite.databases = [
      {
        name: 'Sovereign',
        $id: DATABASE_ID,
        enabled: true,
      },
    ];
    appwrite.tables = tables;

    fs.writeFileSync(appwriteJsonPath, JSON.stringify(appwrite, null, 2) + '\n', 'utf8');
    console.log(`[sync] Synchronized ${tables.length} tables to appwrite.json`);
  }
}

function toPascalCase(str: string): string {
  return str
    .replace(/[_\s-]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function generateTypesNative(tables: CliTable[], outputDir: string, strict: boolean = false): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const lines: string[] = [
    `import type { Models } from 'appwrite';`,
    ``,
    `// This file is auto-generated by the Appwrite CLI type generation engine.`,
    `// You can regenerate it by running \`bun run types:generate\`.`,
    ``,
  ];

  for (const table of tables) {
    const typeName = toPascalCase(table.name);
    lines.push(`export type ${typeName} = Models.Row & {`);

    for (const col of table.columns) {
      const fieldKey = strict ? toCamelCase(col.key) : col.key;
      let tsType = 'string';

      switch (col.type) {
        case 'double':
        case 'float':
        case 'integer':
          tsType = 'number';
          break;
        case 'bigint':
          tsType = 'number | string';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'datetime':
        case 'varchar':
        case 'text':
        case 'string':
        default:
          tsType = 'string';
          break;
      }

      if (col.array) {
        tsType = `${tsType}[]`;
      }

      if (!col.required) {
        tsType = `${tsType} | null`;
      }

      lines.push(`    ${fieldKey}: ${tsType};`);
    }

    lines.push(`};`);
    lines.push(``);
  }

  const dtsPath = path.join(outputDir, 'appwrite.d.ts');
  fs.writeFileSync(dtsPath, lines.join('\n'), 'utf8');
  console.log(`[native] Generated types for ${tables.length} tables at ${dtsPath}`);

  // Generate index.ts wrapper
  const indexPath = path.join(outputDir, 'index.ts');
  const tableIdList = tables.map((t) => `'${t.$id}'`).join(',\n  ');
  const indexLines = [
    `/**`,
    ` * @file types/appwrite/index.ts`,
    ` * @description Typed exports and schema constants for Appwrite Sovereign TablesDB.`,
    ` */`,
    ``,
    `export * from './appwrite.d';`,
    ``,
    `export const SOVEREIGN_DATABASE_ID = '${DATABASE_ID}' as const;`,
    ``,
    `export const SOVEREIGN_TABLE_IDS = [`,
    `  ${tableIdList}`,
    `] as const;`,
    ``,
    `export type SovereignTableId = (typeof SOVEREIGN_TABLE_IDS)[number];`,
    ``,
  ];
  fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf8');
  console.log(`[native] Generated module index at ${indexPath}`);
}

export async function main() {
  const args = process.argv.slice(2);
  const rootDir = process.cwd();

  let language = 'ts';
  let strict = false;
  let outputDir = path.join(rootDir, 'types/appwrite');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--language' || arg === '-l') {
      language = args[++i] || 'ts';
    } else if (arg === '--strict' || arg === '-s') {
      strict = true;
    } else if (arg === '--output' || arg === '-o') {
      outputDir = path.resolve(rootDir, args[++i]);
    } else if (!arg.startsWith('-')) {
      outputDir = path.resolve(rootDir, arg);
    }
  }

  console.log(`=== Appwrite Type Generator ===`);
  console.log(`Language: ${language} | Strict: ${strict} | Output: ${outputDir}`);

  const tables = buildSovereignTables();
  syncConfigFiles(rootDir, tables);

  // Try Appwrite CLI first
  let cliSuccess = false;
  try {
    const cliCmd = ['bunx', 'appwrite-cli', 'types', '--language', language];
    if (strict) cliCmd.push('--strict');
    cliCmd.push(outputDir);

    console.log(`Executing: ${cliCmd.join(' ')}`);
    const proc = spawnSync(cliCmd[0], cliCmd.slice(1), {
      cwd: rootDir,
      encoding: 'utf8',
      env: process.env,
    });

    if (proc.status === 0) {
      console.log(proc.stdout);
      cliSuccess = true;
      console.log('✅ Appwrite CLI type generation succeeded!');
    } else {
      console.warn('⚠️  Appwrite CLI execution returned non-zero:', proc.stderr || proc.stdout);
    }
  } catch (err) {
    console.warn('⚠️  Appwrite CLI execution threw error:', err);
  }

  // Ensure types and index.ts are fully populated
  if (!cliSuccess || !fs.existsSync(path.join(outputDir, 'appwrite.d.ts'))) {
    console.log('Falling back to deterministic schema generator for 100% reliability...');
    generateTypesNative(tables, outputDir, strict);
  } else {
    // Generate index.ts companion if CLI succeeded
    const indexPath = path.join(outputDir, 'index.ts');
    const tableIdList = tables.map((t) => `'${t.$id}'`).join(',\n  ');
    const indexLines = [
      `/**`,
      ` * @file types/appwrite/index.ts`,
      ` * @description Typed exports and schema constants for Appwrite Sovereign TablesDB.`,
      ` */`,
      ``,
      `export * from './appwrite.d';`,
      ``,
      `export const SOVEREIGN_DATABASE_ID = '${DATABASE_ID}' as const;`,
      ``,
      `export const SOVEREIGN_TABLE_IDS = [`,
      `  ${tableIdList}`,
      `] as const;`,
      ``,
      `export type SovereignTableId = (typeof SOVEREIGN_TABLE_IDS)[number];`,
      ``,
    ];
    fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf8');
  }

  console.log(`🎉 Type generation complete for ${tables.length} tables.`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error('Fatal type generation error:', err);
    process.exit(1);
  });
}
