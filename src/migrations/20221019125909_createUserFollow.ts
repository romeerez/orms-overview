import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('userFollow', (t) => ({
    id: t.serial().primaryKey(),
    followerId: t.integer().foreignKey('user', 'id').index(),
    followingId: t.integer().foreignKey('user', 'id').index(),
    ...t.unique(['followerId', 'followingId']),
  }));
});
