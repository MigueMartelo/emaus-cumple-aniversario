import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface DateFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  defaultValue?: string;
}

function autoFormat(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export function DateField({ label, registration, error, defaultValue = '' }: DateFieldProps) {
  const inputId = useMemo(() => label.toLowerCase().replace(/\s+/g, '-'), [label]);
  const [value, setValue] = useState(defaultValue);

  const { onChange, onBlur, name, ref } = registration;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = autoFormat(e.target.value);
    setValue(formatted);
    onChange({ target: { name, value: formatted } } as React.ChangeEvent<HTMLInputElement>);
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.value; // already YYYY-MM-DD
    setValue(picked);
    onChange({ target: { name, value: picked } } as React.ChangeEvent<HTMLInputElement>);
  }

  const borderClass = error
    ? 'border-[#d94b45] focus-within:ring-2 focus-within:ring-[#fde8e7]'
    : 'border-[#d8c6a4] focus-within:border-[#8a5f13] focus-within:ring-2 focus-within:ring-[#f1e3c6]';

  return (
    <label className="grid gap-2 text-sm font-medium text-[#4c4033]" htmlFor={inputId}>
      {label}
      <div className={`flex h-12 items-center rounded-md border bg-white transition sm:h-11 ${borderClass}`}>
        <input
          id={inputId}
          name={name}
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          type="text"
          inputMode="numeric"
          placeholder="AAAA-MM-DD"
          maxLength={10}
          className="h-full flex-1 rounded-md bg-transparent px-3 text-base text-zinc-950 outline-none placeholder:text-zinc-400 sm:text-sm"
        />
        {/* Calendar icon with the native date input overlaid on top — tapping anywhere in this area opens the picker on all browsers/iOS */}
        <div className="relative flex h-full items-center">
          <span className="flex h-full items-center px-3 text-[#8a5f13]" aria-hidden="true">
            <CalendarDays size={17} />
          </span>
          <input
            type="date"
            value={value}
            onChange={handlePickerChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            tabIndex={-1}
            aria-label="Abrir calendario"
          />
        </div>
      </div>
      {error ? <span className="text-xs font-medium text-[#b31316]">{error}</span> : null}
    </label>
  );
}
