import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('user', (t) => ({
    id: t.serial().primaryKey(),
    email: t.text().unique(),
    username: t.text().unique(),
    password: t.text(),
    bio: t.text().nullable(),
    image: t.text().nullable(),
  }));
});
