import 'dotenv/config';
import { create } from 'tests/utils/create';
import { currentUser } from 'tests/factories/user.factory';
import { encryptPassword } from 'lib/password';
import { Client } from 'pg';

export default async () => {
  // For prisma
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

  const db = new Client({
    connectionString: process.env.DATABASE_URL_TEST,
  });
  await db.connect();
  await db.query('TRUNCATE TABLE "user" CASCADE');
  await create(
    'user',
    {
      ...currentUser,
      password: await encryptPassword(currentUser.password),
    },
    {
      db,
    },
  );

  await db.end();
};
