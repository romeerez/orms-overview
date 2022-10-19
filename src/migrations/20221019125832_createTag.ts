import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('tag', (t) => ({
    id: t.serial().primaryKey(),
    tag: t.text().unique(),
  }));
});
