export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  anniversaryDate: string;
  photoUrl: string | null;
  active: boolean;
  spouseId: number | null;
}

export interface BirthdayPerson extends Person {
  age: number;
}

export interface AnniversaryPerson extends Person {
  years: number;
}

export type CelebrationPerson = BirthdayPerson | AnniversaryPerson;

export interface CoupleAnniversary {
  person: AnniversaryPerson;
  spouse: AnniversaryPerson | null;
  years: number;
}

export interface TodayCelebrationsData {
  date: string;
  timeZone: string;
  birthdays: BirthdayPerson[];
  anniversaries: CoupleAnniversary[];
  peopleCount: number;
}

export interface FormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  anniversaryDate: string;
  photo: FileList | null;
}
