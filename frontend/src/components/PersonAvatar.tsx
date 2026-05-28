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
  const base = `${sizeClasses[size]} shrink-0 rounded-full border border-[#e6d8bd]`;

  if (photoUrl) {
    return (
      <img
        src={getMediaUrl(photoUrl)}
        alt={`Foto de ${firstName} ${lastName}`}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <div className={`${base} grid place-items-center bg-[#fff0c2] font-semibold text-[#8a5f13]`}>
      {firstName.charAt(0)}
      {lastName.charAt(0)}
    </div>
  );
}
