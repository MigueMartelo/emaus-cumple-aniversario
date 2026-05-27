import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  appTimeZone: process.env.APP_TIME_ZONE ?? 'America/Bogota',
  adminToken: process.env.ADMIN_TOKEN,
};

export function requireConfig(): void {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL es obligatorio. Copia backend/.env.example a backend/.env y actualízalo si hace falta.');
  }

  if (!config.adminToken) {
    throw new Error('ADMIN_TOKEN es obligatorio. Define un token privado en backend/.env.');
  }
}
