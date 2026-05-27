import { pool } from './db.js';
import type { AnniversaryPerson, BirthdayPerson, DateParts, Person, PersonInput } from './types.js';

const PERSON_COLUMNS = `
  id,
  first_name AS "firstName",
  last_name AS "lastName",
  to_char(date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
  to_char(anniversary_date, 'YYYY-MM-DD') AS "anniversaryDate",
  photo_url AS "photoUrl",
  created_at AS "createdAt"
`;

export async function createPerson(person: PersonInput): Promise<Person> {
  const result = await pool.query<Person>(
    `
      INSERT INTO people (first_name, last_name, date_of_birth, anniversary_date, photo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${PERSON_COLUMNS}
    `,
    [person.firstName, person.lastName, person.dateOfBirth, person.anniversaryDate, person.photoUrl],
  );

  return result.rows[0];
}

export async function listPeople(): Promise<Person[]> {
  const result = await pool.query<Person>(`
    SELECT ${PERSON_COLUMNS}
    FROM people
    ORDER BY created_at DESC, id DESC
  `);

  return result.rows;
}

interface TodayCelebrations {
  birthdays: BirthdayPerson[];
  anniversaries: AnniversaryPerson[];
  peopleCount: number;
}

export async function findTodayCelebrations({ month, day, date }: DateParts): Promise<TodayCelebrations> {
  const [birthdays, anniversaries, totals] = await Promise.all([
    pool.query<BirthdayPerson>(
      `
        SELECT ${PERSON_COLUMNS}, EXTRACT(YEAR FROM AGE($3::date, date_of_birth))::int AS "age"
        FROM people
        WHERE EXTRACT(MONTH FROM date_of_birth) = $1
          AND EXTRACT(DAY FROM date_of_birth) = $2
        ORDER BY first_name, last_name
      `,
      [month, day, date],
    ),
    pool.query<AnniversaryPerson>(
      `
        SELECT ${PERSON_COLUMNS}, EXTRACT(YEAR FROM AGE($3::date, anniversary_date))::int AS "years"
        FROM people
        WHERE EXTRACT(MONTH FROM anniversary_date) = $1
          AND EXTRACT(DAY FROM anniversary_date) = $2
        ORDER BY first_name, last_name
      `,
      [month, day, date],
    ),
    pool.query<{ peopleCount: number }>('SELECT COUNT(*)::int AS "peopleCount" FROM people'),
  ]);

  return {
    birthdays: birthdays.rows,
    anniversaries: anniversaries.rows,
    peopleCount: totals.rows[0].peopleCount,
  };
}
