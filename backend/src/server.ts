import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { config } from './config.js';
import { uploadImage } from './cloudinary.js';
import { getAppDateParts, partsFromIsoDate } from './dateUtils.js';
import { closeDatabase, runMigrations } from './db.js';
import { createPerson, findTodayCelebrations, listPeople } from './peopleRepository.js';
import { uploadPhoto } from './uploads.js';
import { validatePersonPayload } from './validation.js';

const app = express();

app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
app.use(express.json({ limit: '20kb' }));

function requireAdmin(request: Request, response: Response, next: NextFunction): void {
  const token = request.get('x-admin-token');

  if (token !== config.adminToken) {
    response.status(401).json({ message: 'Acceso de administrador requerido.' });
    return;
  }

  next();
}

app.get('/api/health', (_request: Request, response: Response) => {
  response.json({ ok: true, service: 'community-dates-api' });
});

app.post('/api/people', uploadPhoto.single('photo'), async (request: Request, response: Response, next: NextFunction) => {
  try {
    let photoUrl: string | null = null;

    if (request.file) {
      photoUrl = await uploadImage(request.file.buffer);
    }

    const validation = validatePersonPayload({
      ...request.body as Record<string, unknown>,
      photoUrl,
    });

    if (!validation.isValid) {
      response.status(400).json({
        message: 'Por favor corrige los campos resaltados.',
        errors: validation.errors,
      });
      return;
    }

    const person = await createPerson(validation.data);
    response.status(201).json({ person });
  } catch (error) {
    next(error);
  }
});

app.get('/api/people', requireAdmin, async (_request: Request, response: Response, next: NextFunction) => {
  try {
    const people = await listPeople();
    response.json({ people });
  } catch (error) {
    next(error);
  }
});

app.get('/api/celebrations/today', requireAdmin, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const targetDate = request.query['date']
      ? partsFromIsoDate(String(request.query['date']))
      : getAppDateParts(config.appTimeZone);

    const celebrations = await findTodayCelebrations(targetDate);

    response.json({
      date: targetDate.date,
      timeZone: config.appTimeZone,
      ...celebrations,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('debe')) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

interface AppError extends Error {
  code?: string;
}

app.use((error: AppError, _request: Request, response: Response, _next: NextFunction) => {
  if (error.code === 'INVALID_FILE_TYPE') {
    response.status(400).json({
      message: error.message,
      errors: { photo: error.message },
    });
    return;
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    response.status(400).json({
      message: 'La foto no puede pesar más de 5 MB.',
      errors: { photo: 'La foto no puede pesar más de 5 MB.' },
    });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Algo salió mal. Intenta de nuevo.' });
});

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
