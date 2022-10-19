import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('article', (t) => ({
    id: t.serial().primaryKey(),
    authorId: t.integer().foreignKey('user', 'id'),
    slug: t.text().unique(),
    title: t.text(),
    description: t.text(),
    body: t.text(),
    favoritesCount: t.integer().default(0),
    ...t.timestamps(),
  }));
});
