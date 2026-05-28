import { useState } from 'react';
import { X } from 'lucide-react';
import { getMediaUrl } from '../api.ts';

interface PersonAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'h-11 w-11 text-sm',
  md: 'h-12 w-12 text-sm',
};

export function PersonAvatar({ firstName, lastName, photoUrl, size = 'md' }: PersonAvatarProps) {
  const [open, setOpen] = useState(false);
  const base = `${sizeClasses[size]} shrink-0 rounded-full border border-[#e6d8bd]`;

  if (photoUrl) {
    const url = getMediaUrl(photoUrl);
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 cursor-pointer"
          aria-label={`Ver foto de ${firstName} ${lastName}`}
        >
          <img
            src={url}
            alt={`Foto de ${firstName} ${lastName}`}
            className={`${sizeClasses[size]} rounded-full border border-[#e6d8bd] object-cover transition hover:opacity-80 hover:ring-2 hover:ring-[#8a5f13] hover:ring-offset-1`}
          />
        </button>

        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute -right-3 -top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[#3f2c12] shadow-md hover:bg-[#fff0c2]"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
              <img
                src={url}
                alt={`Foto de ${firstName} ${lastName}`}
                className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain shadow-xl"
              />
              <p className="mt-3 text-sm font-medium text-white">
                {firstName} {lastName}
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`${base} grid place-items-center bg-[#fff0c2] font-semibold text-[#8a5f13]`}>
      {firstName.charAt(0)}
      {lastName.charAt(0)}
    </div>
  );
}
