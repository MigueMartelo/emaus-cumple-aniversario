import { Heart, Loader2 } from 'lucide-react';
import type { CoupleAnniversary } from '../types.ts';
import { formatShortDate, fullName } from '../utils.ts';
import { PersonAvatar } from './PersonAvatar.tsx';

interface AnniversaryColumnProps {
  loading: boolean;
  anniversaries: CoupleAnniversary[];
}

export function AnniversaryColumn({ loading, anniversaries }: AnniversaryColumnProps) {
  return (
    <section className="rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#fde8e7] text-[#c91518]">
            <Heart size={21} aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-[#3f2c12] sm:text-lg">Aniversarios</h2>
        </div>
        <span className="rounded-md bg-[#fff1f0] px-2.5 py-1 text-sm font-medium text-[#b31316]">
          {anniversaries.length}
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-36 items-center justify-center rounded-md border border-dashed border-[#d8c6a4] bg-[#fffdf8] text-sm text-[#6f6a60] sm:min-h-40">
          <Loader2 className="mr-2 animate-spin" size={18} aria-hidden="true" />
          Cargando
        </div>
      ) : anniversaries.length === 0 ? (
        <div className="grid min-h-36 place-items-center rounded-md border border-dashed border-[#d8c6a4] bg-[#fffdf8] px-4 text-center text-sm text-[#6f6a60] sm:min-h-40">
          No hay aniversarios hoy.
        </div>
      ) : (
        <div className="grid gap-3">
          {anniversaries.map((entry) => (
            <article
              key={`anniversary-${entry.person.id}`}
              className="rounded-md border border-[#e6d8bd] bg-[#fffdf8] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  {entry.spouse ? (
                    <div className="relative flex shrink-0 items-center">
                      <PersonAvatar
                        firstName={entry.person.firstName}
                        lastName={entry.person.lastName}
                        photoUrl={entry.person.photoUrl}
                        size="md"
                      />
                      <div className="-ml-3 rounded-full ring-2 ring-white">
                        <PersonAvatar
                          firstName={entry.spouse.firstName}
                          lastName={entry.spouse.lastName}
                          photoUrl={entry.spouse.photoUrl}
                          size="md"
                        />
                      </div>
                    </div>
                  ) : (
                    <PersonAvatar
                      firstName={entry.person.firstName}
                      lastName={entry.person.lastName}
                      photoUrl={entry.person.photoUrl}
                      size="md"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-[#3f2c12]">
                      {entry.spouse
                        ? `${entry.person.firstName} & ${entry.spouse.firstName} ${entry.spouse.lastName}`
                        : fullName(entry.person)}
                    </h3>
                    <p className="mt-1 text-sm text-[#6f6a60]">{formatShortDate(entry.person.anniversaryDate)}</p>
                  </div>
                </div>
                <span className="w-fit rounded-md bg-[#fff1f0] px-2.5 py-1 text-sm font-medium text-[#b31316]">
                  {entry.years === 1 ? '1 año' : `${entry.years} años`}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
