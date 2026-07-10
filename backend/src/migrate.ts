import { closeDatabase, runMigrations } from './db.js';

await runMigrations();
await closeDatabase();
console.log('Migraciones completadas.');
