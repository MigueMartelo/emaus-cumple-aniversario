import { useMemo } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface TextFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: string;
}

export function TextField({ label, registration, error, type = 'text' }: TextFieldProps) {
  const inputId = useMemo(() => label.toLowerCase().replace(/\s+/g, '-'), [label]);

  return (
    <label className="grid gap-2 text-sm font-medium text-[#4c4033]" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        type={type}
        {...registration}
        className={`h-12 rounded-md border bg-white px-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-2 sm:h-11 sm:text-sm ${
          error ? 'border-[#d94b45] focus:ring-[#fde8e7]' : 'border-[#d8c6a4] focus:border-[#8a5f13] focus:ring-[#f1e3c6]'
        }`}
      />
      {error ? <span className="text-xs font-medium text-[#b31316]">{error}</span> : null}
    </label>
  );
}
