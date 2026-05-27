import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ApiError, getMediaUrl, listPeople } from '../api.ts';
import type { Person } from '../types.ts';
import { formatShortDate, formatPeopleCount, fullName, groupPeopleByBirthMonth } from '../utils.ts';

interface RegisteredByMonthProps {
  adminToken: string;
  onUnauthorized: () => void;
}

interface RegisteredState {
  status: 'loading' | 'ready' | 'error';
  people: Person[];
  error: string;
}

export function RegisteredByMonth({ adminToken, onUnauthorized }: RegisteredByMonthProps) {
  const [state, setState] = useState<RegisteredState>({ status: 'loading', people: [], error: '' });

  async function loadPeople() {
    setState((current) => ({ ...current, status: 'loading', error: '' }));

    try {
      const data = await listPeople(adminToken);
      setState({ status: 'ready', people: data.people, error: '' });
    } catch (error) {
      if (error instanceof ApiError && error.message.includes('administrador')) {
        onUnauthorized();
        return;
      }

      setState({ status: 'error', people: [], error: 'No se pudo cargar la lista de registrados.' });
    }
  }

  useEffect(() => {
    loadPeople();
  }, [adminToken]);

  const groupedPeople = groupPeopleByBirthMonth(state.people);

  return (
    <section className="grid gap-4 rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#3f2c12]">Registrados por mes de cumpleaños</h2>
          <p className="mt-1 text-sm text-[#6f6a60]">
            {state.status === 'ready' ? formatPeopleCount(state.people.length) : 'Cargando lista de registrados...'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadPeople}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#d8c6a4] bg-white px-4 text-sm font-medium text-[#4c4033] transition hover:border-[#8a5f13] hover:text-[#8a5f13] sm:h-10 sm:w-fit"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {state.status === 'error' ? (
        <div className="rounded-md border border-[#f1b8b6] bg-[#fff1f0] px-4 py-3 text-sm text-[#9b1012]">{state.error}</div>
      ) : null}

      <div className="grid gap-3">
        {groupedPeople.map((group) => (
          <section key={group.month} className="rounded-md border border-[#e6d8bd] bg-[#fffdf8]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e6d8bd] px-4 py-3">
              <h3 className="font-semibold text-[#3f2c12]">{group.month}</h3>
              <span className="rounded-md bg-[#fff7df] px-2.5 py-1 text-sm font-medium text-[#8a5f13]">{group.people.length}</span>
            </div>
            {group.people.length === 0 ? (
              <div className="px-4 py-4 text-sm text-[#6f6a60]">No hay registrados en este mes.</div>
            ) : (
              <div className="divide-y divide-[#eadcc1]">
                {group.people.map((person) => (
                  <article key={person.id} className="flex items-center gap-3 px-4 py-3">
                    {person.photoUrl ? (
                      <img
                        src={getMediaUrl(person.photoUrl)}
                        alt={`Foto de ${fullName(person)}`}
                        className="h-11 w-11 shrink-0 rounded-md border border-[#e6d8bd] object-cover"
                      />
                    ) : (
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#fff0c2] text-sm font-semibold text-[#8a5f13]">
                        {person.firstName.charAt(0)}
                        {person.lastName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="break-words font-semibold text-[#3f2c12]">{fullName(person)}</h4>
                      <p className="mt-1 text-sm text-[#6f6a60]">
                        Cumpleaños: {formatShortDate(person.dateOfBirth)} · Aniversario: {formatShortDate(person.anniversaryDate)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
