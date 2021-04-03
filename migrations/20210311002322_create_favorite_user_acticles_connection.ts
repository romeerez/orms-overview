import { Migration } from 'rake-db';

export const change = (db: Migration) => {
  db.createTable('userArticleFavorite', (t) => {
    t.integer('userId', { index: true }).required().references('user');
    t.integer('articleId', { index: true }).required().references('article');
    t.index(['userId', 'articleId'], { unique: true });
  });
};
