import { Migration } from 'rake-db';

export const change = (db: Migration) => {
  db.createTable('article', (t) => {
    t.integer('authorId', { index: true }).required().references('user');
    t.string('slug', { unique: true }).required();
    t.string('title').required();
    t.string('description').required();
    t.string('body').required();
    t.integer('favoritesCount').required().default(0);
    t.timestamps({ null: false });
  });
};
