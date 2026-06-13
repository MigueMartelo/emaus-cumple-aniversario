export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  anniversaryDate: string;
  photoUrl: string | null;
  active: boolean;
  createdAt: Date;
  spouseId: number | null;
}

export interface BirthdayPerson extends Person {
  age: number;
}

export interface AnniversaryPerson extends Person {
  years: number;
}

export interface CoupleAnniversary {
  person: AnniversaryPerson;
  spouse: AnniversaryPerson | null;
  years: number;
}

export interface DateParts {
  date: string;
  month: number;
  day: number;
}

export interface PersonInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  anniversaryDate: string;
  photoUrl: string | null;
}

export interface ValidationResult {
  data: PersonInput;
  errors: Record<string, string>;
  isValid: boolean;
}
