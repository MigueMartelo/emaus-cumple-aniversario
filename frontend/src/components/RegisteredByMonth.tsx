import { useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, RefreshCw } from 'lucide-react';
import { ApiError, listPeople, setPersonActive } from '../api.ts';
import type { Person } from '../types.ts';
import { formatShortDate, formatPeopleCount, fullName, groupPeopleByBirthMonth } from '../utils.ts';
import { PersonAvatar } from './PersonAvatar.tsx';
import { EditPersonModal } from './EditPersonModal.tsx';

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
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

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

  function replacePerson(updated: Person) {
    setState((current) => ({
      ...current,
      people: current.people.map((p) => (p.id === updated.id ? updated : p)),
    }));
  }

  async function handleToggleActive(person: Person) {
    try {
      const data = await setPersonActive(adminToken, person.id, !person.active);
      replacePerson(data.person);
    } catch (error) {
      if (error instanceof ApiError && error.message.includes('administrador')) {
        onUnauthorized();
      }
    }
  }

  const activePeople = state.people.filter((p) => p.active);
  const groupedPeople = groupPeopleByBirthMonth(state.people);

  return (
    <>
      <section className="grid gap-4 rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#3f2c12]">Registrados por mes de cumpleaños</h2>
            <p className="mt-1 text-sm text-[#6f6a60]">
              {state.status === 'ready'
                ? formatPeopleCount(activePeople.length)
                : 'Cargando lista de registrados...'}
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
                <span className="rounded-md bg-[#fff7df] px-2.5 py-1 text-sm font-medium text-[#8a5f13]">
                  {group.people.filter((p) => p.active).length}
                </span>
              </div>
              {group.people.length === 0 ? (
                <div className="px-4 py-4 text-sm text-[#6f6a60]">No hay registrados en este mes.</div>
              ) : (
                <div className="divide-y divide-[#eadcc1]">
                  {group.people.map((person) => (
                    <article
                      key={person.id}
                      className={`flex items-center gap-3 px-4 py-3 ${!person.active ? 'opacity-50' : ''}`}
                    >
                      <PersonAvatar firstName={person.firstName} lastName={person.lastName} photoUrl={person.photoUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="break-words font-semibold text-[#3f2c12]">{fullName(person)}</h4>
                          {!person.active && (
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#6f6a60]">
                          Cumpleaños: {formatShortDate(person.dateOfBirth)} · Aniversario: {formatShortDate(person.anniversaryDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {person.active ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingPerson(person)}
                              title="Editar"
                              className="grid h-8 w-8 place-items-center rounded-md text-[#6f6a60] transition hover:bg-[#f5ede0] hover:text-[#8a5f13]"
                            >
                              <Pencil size={15} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(person)}
                              title="Desactivar"
                              className="grid h-8 w-8 place-items-center rounded-md text-[#6f6a60] transition hover:bg-[#fff1f0] hover:text-[#b31316]"
                            >
                              <EyeOff size={15} aria-hidden="true" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(person)}
                            title="Reactivar"
                            className="grid h-8 w-8 place-items-center rounded-md text-[#6f6a60] transition hover:bg-[#f0faef] hover:text-[#2f6f39]"
                          >
                            <Eye size={15} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      {editingPerson ? (
        <EditPersonModal
          person={editingPerson}
          adminToken={adminToken}
          onSaved={(updated) => {
            replacePerson(updated);
            setEditingPerson(null);
          }}
          onClose={() => setEditingPerson(null)}
        />
      ) : null}
    </>
  );
}
