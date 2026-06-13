import { pool } from './db.js';
import type { AnniversaryPerson, BirthdayPerson, CoupleAnniversary, DateParts, Person, PersonInput } from './types.js';

const PERSON_COLUMNS = `
  id,
  first_name AS "firstName",
  last_name AS "lastName",
  to_char(date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
  to_char(anniversary_date, 'YYYY-MM-DD') AS "anniversaryDate",
  photo_url AS "photoUrl",
  active,
  created_at AS "createdAt",
  spouse_id AS "spouseId"
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

export async function getPersonById(id: number): Promise<Person | null> {
  const result = await pool.query<Person>(
    `SELECT ${PERSON_COLUMNS} FROM people WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updatePerson(id: number, person: PersonInput): Promise<Person | null> {
  const result = await pool.query<Person>(
    `
      UPDATE people
      SET first_name = $1, last_name = $2, date_of_birth = $3, anniversary_date = $4, photo_url = $5
      WHERE id = $6
      RETURNING ${PERSON_COLUMNS}
    `,
    [person.firstName, person.lastName, person.dateOfBirth, person.anniversaryDate, person.photoUrl, id],
  );
  return result.rows[0] ?? null;
}

export async function setPersonActive(id: number, active: boolean): Promise<Person | null> {
  const result = await pool.query<Person>(
    `UPDATE people SET active = $1 WHERE id = $2 RETURNING ${PERSON_COLUMNS}`,
    [active, id],
  );
  return result.rows[0] ?? null;
}

export async function listPeople(): Promise<Person[]> {
  const result = await pool.query<Person>(`
    SELECT ${PERSON_COLUMNS}
    FROM people
    ORDER BY active DESC, created_at DESC, id DESC
  `);

  return result.rows;
}

export async function setSpouse(id: number, spouseId: number | null): Promise<Person | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query<{ spouseId: number | null }>(
      'SELECT spouse_id AS "spouseId" FROM people WHERE id = $1',
      [id],
    );
    if (!current.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    const oldSpouseId = current.rows[0].spouseId;

    // Clear old spouse's back-link
    if (oldSpouseId && oldSpouseId !== spouseId) {
      await client.query('UPDATE people SET spouse_id = NULL WHERE id = $1', [oldSpouseId]);
    }

    // If new spouse already has a different link, clear it
    if (spouseId) {
      const newSpouseCurrent = await client.query<{ spouseId: number | null }>(
        'SELECT spouse_id AS "spouseId" FROM people WHERE id = $1',
        [spouseId],
      );
      const newSpouseOldLink = newSpouseCurrent.rows[0]?.spouseId ?? null;
      if (newSpouseOldLink && newSpouseOldLink !== id) {
        await client.query('UPDATE people SET spouse_id = NULL WHERE id = $1', [newSpouseOldLink]);
      }
      await client.query('UPDATE people SET spouse_id = $1 WHERE id = $2', [id, spouseId]);
    }

    await client.query('UPDATE people SET spouse_id = $1 WHERE id = $2', [spouseId, id]);
    await client.query('COMMIT');

    const result = await client.query<Person>(`SELECT ${PERSON_COLUMNS} FROM people WHERE id = $1`, [id]);
    return result.rows[0] ?? null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

interface TodayCelebrations {
  birthdays: BirthdayPerson[];
  anniversaries: CoupleAnniversary[];
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
          AND active = TRUE
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
          AND active = TRUE
        ORDER BY first_name, last_name
      `,
      [month, day, date],
    ),
    pool.query<{ peopleCount: number }>('SELECT COUNT(*)::int AS "peopleCount" FROM people WHERE active = TRUE'),
  ]);

  const processed = new Set<number>();
  const coupleAnniversaries: CoupleAnniversary[] = [];

  for (const person of anniversaries.rows) {
    if (processed.has(person.id)) continue;
    processed.add(person.id);

    const spouse = person.spouseId
      ? (anniversaries.rows.find((p) => p.id === person.spouseId) ?? null)
      : null;

    if (spouse) {
      processed.add(spouse.id);
    }

    coupleAnniversaries.push({ person, spouse, years: person.years });
  }

  return {
    birthdays: birthdays.rows,
    anniversaries: coupleAnniversaries,
    peopleCount: totals.rows[0].peopleCount,
  };
}
