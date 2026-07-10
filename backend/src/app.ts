import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { createUploadSignature } from './cloudinary.js';
import { getAppDateParts, partsFromIsoDate } from './dateUtils.js';
import { createPerson, findTodayCelebrations, getPersonById, listPeople, setPersonActive, setSpouse, updatePerson } from './peopleRepository.js';
import { validatePersonPayload } from './validation.js';

const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
app.use(express.json({ limit: '20kb' }));

app.use((request: Request, response: Response, next: NextFunction) => {
  const start = Date.now();

  response.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${request.method} ${request.path} ${response.statusCode} - ${duration}ms`);
  });

  next();
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function requireAdmin(request: Request, response: Response, next: NextFunction): void {
  const token = request.get('x-admin-token');

  if (token !== config.adminToken) {
    response.status(401).json({ message: 'Acceso de administrador requerido.' });
    return;
  }

  next();
}

function parseId(param: string | string[] | undefined): number | null {
  const value = Array.isArray(param) ? param[0] : param;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/health', (_request: Request, response: Response) => {
  response.json({ ok: true, service: 'community-dates-api' });
});

app.get('/api/uploads/signature', registrationLimiter, (_request: Request, response: Response) => {
  response.json(createUploadSignature());
});

app.post('/api/people', registrationLimiter, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const validation = validatePersonPayload(request.body as Record<string, unknown>);

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

app.patch('/api/people/:id', requireAdmin, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseId(request.params['id']);
    if (!id) {
      response.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const existing = await getPersonById(id);
    if (!existing) {
      response.status(404).json({ message: 'Persona no encontrada.' });
      return;
    }

    const validation = validatePersonPayload({
      ...request.body as Record<string, unknown>,
      photoUrl: existing.photoUrl,
    });

    if (!validation.isValid) {
      response.status(400).json({ message: 'Por favor corrige los campos resaltados.', errors: validation.errors });
      return;
    }

    const person = await updatePerson(id, validation.data);
    response.json({ person });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/people/:id/spouse', requireAdmin, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseId(request.params['id']);
    if (!id) {
      response.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const { spouseId } = request.body as { spouseId: unknown };
    if (spouseId !== null && (typeof spouseId !== 'number' || !Number.isInteger(spouseId) || spouseId <= 0)) {
      response.status(400).json({ message: 'spouseId debe ser un número entero positivo o null.' });
      return;
    }

    if (spouseId === id) {
      response.status(400).json({ message: 'Una persona no puede ser su propia pareja.' });
      return;
    }

    const person = await setSpouse(id, typeof spouseId === 'number' ? spouseId : null);
    if (!person) {
      response.status(404).json({ message: 'Persona no encontrada.' });
      return;
    }

    response.json({ person });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/people/:id/active', requireAdmin, async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseId(request.params['id']);
    if (!id) {
      response.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const { active } = request.body as { active?: unknown };
    if (typeof active !== 'boolean') {
      response.status(400).json({ message: 'El campo active debe ser un booleano.' });
      return;
    }

    const person = await setPersonActive(id, active);
    if (!person) {
      response.status(404).json({ message: 'Persona no encontrada.' });
      return;
    }

    response.json({ person });
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

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Algo salió mal. Intenta de nuevo.' });
});

export default app;
