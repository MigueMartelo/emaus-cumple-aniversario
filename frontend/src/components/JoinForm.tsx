import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Heart, Loader2, Save } from 'lucide-react';
import { ApiError, createPerson } from '../api.ts';
import type { FormValues, Person } from '../types.ts';
import { fullName } from '../utils.ts';
import { TextField } from './TextField.tsx';
import { DateField } from './DateField.tsx';
import { FileField } from './FileField.tsx';

export function JoinForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      anniversaryDate: '',
      photo: null,
    },
  });
  const [success, setSuccess] = useState<Person | null>(null);
  const [formError, setFormError] = useState('');

  async function onSubmit(values: FormValues) {
    setSuccess(null);
    setFormError('');

    try {
      const data = await createPerson(values);
      setSuccess(data.person);
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.errors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: 'server', message });
        });
        setFormError(error.message);
        return;
      }

      setFormError('No se pudo conectar con el servidor. Intenta de nuevo.');
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-lg border border-[#e6d8bd] bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-[#3f2c12] sm:text-2xl">Registra tus fechas</h1>
            <p className="mt-1 text-sm leading-snug text-[#6f6a60]">Comparte las fechas que la comunidad debe recordar.</p>
          </div>
          <div className="hidden h-11 w-11 place-items-center rounded-lg bg-[#fde8e7] text-[#c91518] sm:grid">
            <Heart size={22} aria-hidden="true" />
          </div>
        </div>

        <form className="grid gap-4 sm:gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nombre"
              error={errors.firstName?.message}
              registration={register('firstName', {
                required: 'El nombre es obligatorio.',
                maxLength: { value: 80, message: 'El nombre debe tener 80 caracteres o menos.' },
              })}
            />
            <TextField
              label="Apellido"
              error={errors.lastName?.message}
              registration={register('lastName', {
                required: 'El apellido es obligatorio.',
                maxLength: { value: 80, message: 'El apellido debe tener 80 caracteres o menos.' },
              })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              label="Fecha de nacimiento"
              error={errors.dateOfBirth?.message}
              registration={register('dateOfBirth', {
                required: 'La fecha de nacimiento es obligatoria.',
                pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Usa el formato AAAA-MM-DD.' },
              })}
            />
            <DateField
              label="Fecha de aniversario"
              error={errors.anniversaryDate?.message}
              registration={register('anniversaryDate', {
                required: 'La fecha de aniversario es obligatoria.',
                pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Usa el formato AAAA-MM-DD.' },
              })}
            />
          </div>

          <FileField
            label="Foto"
            error={errors.photo?.message}
            registration={register('photo', {
              validate: {
                imageOnly: (files) => {
                  const file = files?.[0];
                  return !file || file.type.startsWith('image/') || 'Solo se permiten archivos de imagen.';
                },
                maxSize: (files) => {
                  const file = files?.[0];
                  return !file || file.size <= 15 * 1024 * 1024 || 'La foto no puede pesar más de 15 MB.';
                },
              },
            })}
          />

          {formError ? (
            <div className="rounded-md border border-[#f1b8b6] bg-[#fff1f0] px-4 py-3 text-sm text-[#9b1012]">{formError}</div>
          ) : null}

          {success ? (
            <div className="flex items-start gap-3 rounded-md border border-[#b8d6bd] bg-[#f0faef] px-4 py-3 text-sm text-[#2f6f39]">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
              <span>{fullName(success)} fue agregado a la lista de la comunidad.</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#8a5f13] px-5 text-sm font-semibold text-white transition hover:bg-[#704b0f] disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-11 sm:w-fit"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
            Guardar fechas
          </button>
        </form>
      </div>
    </section>
  );
}
