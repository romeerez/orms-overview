import { Migration } from 'rake-db';

export const change = (db: Migration) => {
  db.createTable('comment', (t) => {
    t.integer('authorId').required().references('user');
    t.integer('articleId').required().references('article');
    t.string('body').required();
    t.timestamps({ null: false });
  });
};
