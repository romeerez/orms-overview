import { OrmInterface } from '../types';
import { db } from './db';
import { articleRepo } from './article/article.repo';

export const kysely: OrmInterface = {
  close() {
    return db.destroy();
  },
  articleRepo,
  commentRepo: {} as any,
  tagRepo: {} as any,
  profileRepo: {} as any,
  userRepo: {} as any,
};
