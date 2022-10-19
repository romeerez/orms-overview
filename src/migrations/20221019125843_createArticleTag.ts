import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('articleTag', (t) => ({
    id: t.serial().primaryKey(),
    articleId: t.integer().foreignKey('article', 'id'),
    tagId: t.integer().foreignKey('tag', 'id'),
    ...t.unique(['articleId', 'tagId']),
  }));
});
