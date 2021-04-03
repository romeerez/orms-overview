import { Migration } from 'rake-db';

export const change = (db: Migration) => {
  db.createTable('articleTag', (t) => {
    t.integer('articleId', { index: true }).required().references('article');
    t.integer('tagId', { index: true }).required().references('tag');
    t.index(['articleId', 'tagId'], { unique: true });
  });
};
