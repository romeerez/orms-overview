import pgPromise from 'pg-promise';
import { db as defaultDb } from 'tests/utils/db';
import { Client, Pool } from 'pg';

const pgp = pgPromise({
  capSQL: true,
});

// eslint-disable-next-line @typescript-eslint/ban-types
export const create = async <T extends object | object[]>(
  table: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  record: object,
  {
    onConflict,
    db = defaultDb,
  }: {
    onConflict?: string;
    db?: Client | Pool;
  } = {},
): Promise<T> => {
  const result = await db.query(
    `${pgp.helpers.insert(
      record,
      Object.keys(Array.isArray(record) ? record[0] : record),
      table,
    )}${onConflict ? ` ON CONFLICT ${onConflict}` : ''} RETURNING *`,
  );

  const { rows } = result;
  return Array.isArray(record) ? rows : rows[0];
};
