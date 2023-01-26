import { TagRepo } from '../../types';
import { db } from '../database';
import { createRepo } from 'orchid-orm';

export const tagRepo = createRepo(db.tag, {
  queryMethods: {
    deleteUnused(q) {
      return q.whereNotExists('articleTags').delete();
    },
  },
});

export default {
  async listTags() {
    return await db.tag.order({ tag: 'DESC' });
  },
} as TagRepo;
