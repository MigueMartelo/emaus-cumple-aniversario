import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { CelebrationPerson } from '../types.ts';
import { formatShortDate, fullName } from '../utils.ts';
import { PersonAvatar } from './PersonAvatar.tsx';

interface CelebrationColumnProps {
  title: string;
  icon: LucideIcon;
  accent: string;
  countStyle: string;
  detailStyle: string;
  loading: boolean;
  emptyText: string;
  people: CelebrationPerson[];
  detail: (person: CelebrationPerson) => string;
  dateField: keyof CelebrationPerson;
}

export function CelebrationColumn({
  title,
  icon: Icon,
  accent,
  countStyle,
  detailStyle,
  loading,
  emptyText,
  people,
  detail,
  dateField,
}: CelebrationColumnProps) {
  return (
    <section className="rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>
            <Icon size={21} aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-[#3f2c12] sm:text-lg">{title}</h2>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-sm font-medium ${countStyle}`}>{people.length}</span>
      </div>

      {loading ? (
        <div className="flex min-h-36 items-center justify-center rounded-md border border-dashed border-[#d8c6a4] bg-[#fffdf8] text-sm text-[#6f6a60] sm:min-h-40">
          <Loader2 className="mr-2 animate-spin" size={18} aria-hidden="true" />
          Cargando
        </div>
      ) : people.length === 0 ? (
        <div className="grid min-h-36 place-items-center rounded-md border border-dashed border-[#d8c6a4] bg-[#fffdf8] px-4 text-center text-sm text-[#6f6a60] sm:min-h-40">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-3">
          {people.map((person) => (
            <article key={`${title}-${person.id}`} className="rounded-md border border-[#e6d8bd] bg-[#fffdf8] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <PersonAvatar firstName={person.firstName} lastName={person.lastName} photoUrl={person.photoUrl} size="md" />
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-[#3f2c12]">{fullName(person)}</h3>
                    <p className="mt-1 text-sm text-[#6f6a60]">{formatShortDate(String(person[dateField]))}</p>
                  </div>
                </div>
                <span className={`w-fit rounded-md px-2.5 py-1 text-sm font-medium ${detailStyle}`}>{detail(person)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
