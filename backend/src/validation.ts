import type { PersonInput, ValidationResult } from './types.js';
import { config } from './config.js';
import { getAppDateParts, validateIsoDate } from './dateUtils.js';

function cleanName(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

interface PersonBody {
  firstName?: unknown;
  lastName?: unknown;
  dateOfBirth?: unknown;
  anniversaryDate?: unknown;
  photoUrl?: unknown;
}

export function validatePersonPayload(body: PersonBody): ValidationResult {
  const errors: Record<string, string> = {};
  const today = getAppDateParts(config.appTimeZone).date;

  const person: PersonInput = {
    firstName: cleanName(body.firstName),
    lastName: cleanName(body.lastName),
    dateOfBirth: typeof body.dateOfBirth === 'string' ? body.dateOfBirth : '',
    anniversaryDate: typeof body.anniversaryDate === 'string' ? body.anniversaryDate : '',
    photoUrl: typeof body.photoUrl === 'string' ? body.photoUrl : null,
  };

  if (!person.firstName) {
    errors['firstName'] = 'El nombre es obligatorio.';
  } else if (person.firstName.length > 80) {
    errors['firstName'] = 'El nombre debe tener 80 caracteres o menos.';
  }

  if (!person.lastName) {
    errors['lastName'] = 'El apellido es obligatorio.';
  } else if (person.lastName.length > 80) {
    errors['lastName'] = 'El apellido debe tener 80 caracteres o menos.';
  }

  const birthDateError = validateIsoDate(person.dateOfBirth, 'La fecha de nacimiento');
  if (birthDateError) {
    errors['dateOfBirth'] = birthDateError;
  } else if (person.dateOfBirth > today) {
    errors['dateOfBirth'] = 'La fecha de nacimiento no puede estar en el futuro.';
  }

  const anniversaryDateError = validateIsoDate(person.anniversaryDate, 'La fecha de aniversario');
  if (anniversaryDateError) {
    errors['anniversaryDate'] = anniversaryDateError;
  } else if (person.anniversaryDate > today) {
    errors['anniversaryDate'] = 'La fecha de aniversario no puede estar en el futuro.';
  }

  return {
    data: person,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
