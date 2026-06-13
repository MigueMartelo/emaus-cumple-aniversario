import { useCallback, useEffect, useState } from 'react';
import { Gift, RefreshCw } from 'lucide-react';
import { ApiError, getTodayCelebrations } from '../api.ts';
import type { TodayCelebrationsData } from '../types.ts';
import { formatLongDate, formatPeopleCount } from '../utils.ts';
import { AnniversaryColumn } from './AnniversaryColumn.tsx';
import { CelebrationColumn } from './CelebrationColumn.tsx';

interface DashboardProps {
  adminToken: string;
  onUnauthorized: () => void;
}

interface DashboardState {
  status: 'loading' | 'ready' | 'error';
  data: TodayCelebrationsData | null;
  error: string;
}

export function Dashboard({ adminToken, onUnauthorized }: DashboardProps) {
  const [state, setState] = useState<DashboardState>({ status: 'loading', data: null, error: '' });

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));

    try {
      const data = await getTodayCelebrations(adminToken);
      setState({ status: 'ready', data, error: '' });
    } catch (error) {
      if (error instanceof ApiError && error.message.includes('administrador')) {
        onUnauthorized();
        return;
      }

      setState({ status: 'error', data: null, error: 'No se pudo cargar el tablero. Revisa que la API esté funcionando.' });
    }
  }, [adminToken, onUnauthorized]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const data = state.data;

  return (
    <section className="grid gap-4 sm:gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-xl font-semibold tracking-normal text-[#3f2c12] sm:text-2xl">Tablero de hoy</h1>
          <p className="mt-1 text-sm leading-snug text-[#6f6a60]">
            {data ? `${formatLongDate(data.date)} en ${data.timeZone}` : 'Cargando la fecha de hoy...'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#d8c6a4] bg-white px-4 text-sm font-medium text-[#4c4033] transition hover:border-[#8a5f13] hover:text-[#8a5f13] sm:h-10 sm:w-fit"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {state.status === 'error' ? (
        <div className="rounded-md border border-[#f1b8b6] bg-[#fff1f0] px-4 py-3 text-sm text-[#9b1012]">{state.error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <CelebrationColumn
          title="Cumpleaños"
          icon={Gift}
          accent="bg-[#fff0c2] text-[#8a5f13]"
          countStyle="bg-[#fff7df] text-[#8a5f13]"
          detailStyle="bg-[#fff7df] text-[#8a5f13]"
          loading={state.status === 'loading'}
          emptyText="No hay cumpleaños hoy."
          people={data?.birthdays ?? []}
          detail={(person) => ('age' in person ? (person.age === 1 ? '1 año' : `${person.age} años`) : '')}
          dateField="dateOfBirth"
        />
        <AnniversaryColumn
          loading={state.status === 'loading'}
          anniversaries={data?.anniversaries ?? []}
        />
      </div>

      <div className="rounded-lg border border-[#e6d8bd] bg-white px-4 py-3 text-sm text-[#6f6a60] sm:px-5 sm:py-4">
        {data ? formatPeopleCount(data.peopleCount) : 'Aquí aparecerá el total de personas registradas.'}
      </div>
    </section>
  );
}
