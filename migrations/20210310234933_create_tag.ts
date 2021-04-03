import { Migration } from 'rake-db';

export const change = (db: Migration) => {
  db.createTable('tag', (t) => {
    t.string('tag', { unique: true }).required();
  });
};
