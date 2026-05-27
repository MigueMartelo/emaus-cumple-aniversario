import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config, requireConfig } from './config.js';

const { Pool } = pg;

requireConfig();

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new Pool({
  connectionString: config.databaseUrl!,
});

export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(dirname, 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schema);
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
