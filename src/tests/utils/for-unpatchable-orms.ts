import { create } from 'tests/utils/create';
import { currentUser } from 'tests/factories/user.factory';
import { encryptPassword } from 'lib/password';
import { db } from 'tests/utils/db';
import { isUnpatchableOrm } from './constants';

const remove = (table: string, where?: string) =>
  db.query(`DELETE FROM "${table}"${where ? ` WHERE ${where}` : ''}`);

const clearTables = async () => {
  await remove('comment');
  await remove('articleTag');
  await remove('tag');
  await remove('userArticleFavorite');
  await remove('article');
  await remove('userFollow');
  await remove('user');
  await create('user', {
    ...currentUser,
    password: await encryptPassword(currentUser.password),
  });
};

export const clearDatabaseForUnpatchableOrms = () => {
  if (!isUnpatchableOrm) return;

  afterEach(clearTables);
};
