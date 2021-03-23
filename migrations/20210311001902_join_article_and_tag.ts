import { Migration } from 'rake-db';

export const change = (db: Migration, up: boolean) => {
  db.createTable('articleTag', { id: false }, (t) => {
    t.integer('articleId', { index: true }).required().references('article');
    t.integer('tagId', { index: true }).required().references('tag');
    t.index(['articleId', 'tagId'], { unique: true });
  });
};
