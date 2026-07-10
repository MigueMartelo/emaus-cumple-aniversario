import { config } from './config.js';
import app from './app.js';
import { closeDatabase, runMigrations } from './db.js';

await runMigrations();

const server = app.listen(config.port, () => {
  console.log(`API de Cumpleaños y Aniversarios Emaús Parejas en http://localhost:${config.port}`);
});

async function shutdown(): Promise<void> {
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
