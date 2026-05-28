import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, X } from 'lucide-react';
import { ApiError, updatePerson } from '../api.ts';
import type { Person } from '../types.ts';
import { TextField } from './TextField.tsx';
import { DateField } from './DateField.tsx';

interface EditPersonModalProps {
  person: Person;
  adminToken: string;
  onSaved: (person: Person) => void;
  onClose: () => void;
}

interface EditValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  anniversaryDate: string;
}

export function EditPersonModal({ person, adminToken, onSaved, onClose }: EditPersonModalProps) {
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    defaultValues: {
      firstName: person.firstName,
      lastName: person.lastName,
      dateOfBirth: person.dateOfBirth,
      anniversaryDate: person.anniversaryDate,
    },
  });

  async function onSubmit(values: EditValues) {
    setFormError('');
    try {
      const data = await updatePerson(adminToken, person.id, values);
      onSaved(data.person);
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.errors).forEach(([field, message]) => {
          setError(field as keyof EditValues, { type: 'server', message });
        });
        setFormError(error.message);
        return;
      }
      setFormError('No se pudo guardar los cambios. Intenta de nuevo.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-lg border border-[#e6d8bd] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6d8bd] px-5 py-4">
          <h2 className="font-semibold text-[#3f2c12]">Editar persona</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-[#6f6a60] transition hover:bg-[#f5ede0] hover:text-[#3f2c12]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit(onSubmit)}>
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
              defaultValue={person.dateOfBirth}
              error={errors.dateOfBirth?.message}
              registration={register('dateOfBirth', {
                required: 'La fecha de nacimiento es obligatoria.',
                pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Usa el formato AAAA-MM-DD.' },
              })}
            />
            <DateField
              label="Fecha de aniversario"
              defaultValue={person.anniversaryDate}
              error={errors.anniversaryDate?.message}
              registration={register('anniversaryDate', {
                required: 'La fecha de aniversario es obligatoria.',
                pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Usa el formato AAAA-MM-DD.' },
              })}
            />
          </div>

          {formError ? (
            <div className="rounded-md border border-[#f1b8b6] bg-[#fff1f0] px-4 py-3 text-sm text-[#9b1012]">{formError}</div>
          ) : null}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d8c6a4] px-4 text-sm font-medium text-[#4c4033] transition hover:border-[#8a5f13] hover:text-[#8a5f13]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8a5f13] px-4 text-sm font-semibold text-white transition hover:bg-[#704b0f] disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
