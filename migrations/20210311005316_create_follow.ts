import { Migration } from 'rake-db';

export const change = (db: Migration) => {
  db.createTable('userFollow', (t) => {
    t.integer('followerId', { index: true }).required().references('user');
    t.integer('followingId', { index: true }).required().references('user');
    t.index(['followerId', 'followingId'], { unique: true });
  });
};
