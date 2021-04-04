import { create } from 'tests/utils/create';
import { currentUser } from 'tests/factories/user.factory';
import { encryptPassword } from 'lib/password';
import { db } from 'tests/utils/db';

const isPrisma = process.env.ORM === 'prisma';

const remove = (table: string, where?: string) =>
  db.query(`DELETE FROM "${table}"${where ? ` WHERE ${where}` : ''}`);

const clearTables = async () => {
  await remove('comment');
  await remove('articleTag');
  await remove('userArticleFavorite');
  await remove('article');
  await remove('userFollow');
  await remove('user');
};

export const clearDatabase = () => {
  if (!isPrisma) return;

  beforeAll(async () => {
    await clearTables();
    await create('user', {
      ...currentUser,
      password: await encryptPassword(currentUser.password),
    });
  });

  afterAll(async () => {
    await clearTables();
  });
};
