import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('userArticleFavorite', (t) => ({
    id: t.serial().primaryKey(),
    userId: t.integer().foreignKey('user', 'id'),
    articleId: t.integer().foreignKey('article', 'id'),
    ...t.unique(['userId', 'articleId']),
  }));
});
