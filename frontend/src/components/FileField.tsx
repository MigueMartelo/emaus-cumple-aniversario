import { useMemo } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { ImagePlus } from "lucide-react";

interface FileFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

export function FileField({ label, registration, error }: FileFieldProps) {
  const inputId = useMemo(
    () => label.toLowerCase().replace(/\s+/g, "-"),
    [label],
  );

  return (
    <label
      className="grid gap-2 text-sm font-medium text-[#4c4033]"
      htmlFor={inputId}
    >
      {label}
      <span
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-[#fffdf8] px-4 py-5 text-center transition sm:min-h-24 ${
          error ? "border-[#d94b45]" : "border-[#d8c6a4] hover:border-[#8a5f13]"
        }`}
      >
        <ImagePlus
          className={error ? "text-[#b31316]" : "text-[#8a5f13]"}
          size={24}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-[#3f2c12]">
          Seleccionar foto
        </span>
        <span className="text-xs font-normal text-[#6f6a60]">
          JPG, PNG, WebP o GIF. Máximo 15 MB.
        </span>
      </span>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        {...registration}
        className="sr-only"
      />
      {error ? (
        <span className="text-xs font-medium text-[#b31316]">{error}</span>
      ) : null}
    </label>
  );
}
