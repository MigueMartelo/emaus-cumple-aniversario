import type { Person } from './types.ts';
import { MONTHS } from './constants.ts';

interface MonthGroup {
  month: string;
  index: number;
  people: Person[];
}

export function getInitialView(): string {
  const path = window.location.pathname;
  if (path.includes('tablero') || path.includes('admin') || path.includes('dashboard')) return 'dashboard';
  if (path.includes('lista') || path.includes('list')) return 'list';
  return 'join';
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function fullName(person: Person): string {
  return `${person.firstName} ${person.lastName}`;
}

export function formatPeopleCount(count: number): string {
  return count === 1
    ? '1 persona registrada en la comunidad.'
    : `${count} personas registradas en la comunidad.`;
}

function getBirthdayMonthIndex(person: Person): number {
  return Number(person.dateOfBirth.slice(5, 7)) - 1;
}

function getBirthdayDay(person: Person): number {
  return Number(person.dateOfBirth.slice(8, 10));
}

export function groupPeopleByBirthMonth(people: Person[]): MonthGroup[] {
  const groups: MonthGroup[] = MONTHS.map((month, index) => ({ month, index, people: [] }));

  people.forEach((person) => {
    const monthIndex = getBirthdayMonthIndex(person);
    if (groups[monthIndex]) {
      groups[monthIndex].people.push(person);
    }
  });

  groups.forEach((group) => {
    group.people.sort((first, second) => {
      const dayDiff = getBirthdayDay(first) - getBirthdayDay(second);
      return dayDiff || fullName(first).localeCompare(fullName(second), 'es-CO');
    });
  });

  return groups;
}
