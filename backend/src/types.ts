export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  anniversaryDate: string;
  photoUrl: string | null;
  createdAt: Date;
}

export interface BirthdayPerson extends Person {
  age: number;
}

export interface AnniversaryPerson extends Person {
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
