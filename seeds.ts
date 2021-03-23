import 'dotenv/config';
import { db, create } from 'tests/utils/create';
import { currentUser } from 'tests/factories/user.factory';
import { encryptPassword } from 'lib/password';

const main = async () => {
  await db.connect();
  await db.query('TRUNCATE TABLE "user" CASCADE');
  await create('user', {
    ...currentUser,
    password: await encryptPassword(currentUser.password),
  });

  db.end();
};

main();
