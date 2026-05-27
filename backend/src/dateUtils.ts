import type { DateParts } from './types.js';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function validateIsoDate(value: unknown, fieldName: string): string | null {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) {
    return `${fieldName} debe usar el formato AAAA-MM-DD.`;
  }

  const [, year, month, day] = ISO_DATE_PATTERN.exec(value)!;
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    parsedDate.getUTCFullYear() === Number(year) &&
    parsedDate.getUTCMonth() + 1 === Number(month) &&
    parsedDate.getUTCDate() === Number(day);

  return isValidDate ? null : `${fieldName} debe ser una fecha real del calendario.`;
}

export function getAppDateParts(timeZone: string, date: Date = new Date()): DateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return partsFromIsoDate(`${parts['year']}-${parts['month']}-${parts['day']}`);
}

export function partsFromIsoDate(value: string): DateParts {
  const error = validateIsoDate(value, 'La fecha');

  if (error) {
    throw new Error(error);
  }

  const [, , month, day] = ISO_DATE_PATTERN.exec(value)!;

  return {
    date: value,
    month: Number(month),
    day: Number(day),
  };
}
