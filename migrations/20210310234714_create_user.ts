import { Migration } from 'rake-db';

export const change = (db: Migration, up: boolean) => {
  db.createTable('user', (t) => {
    t.string('email', { unique: true }).required();
    t.string('username', { unique: true }).required();
    t.string('password').required();
    t.string('bio');
    t.string('image');
  });
};
