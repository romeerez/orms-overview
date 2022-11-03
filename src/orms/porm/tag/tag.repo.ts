import { TagRepo } from '../../types';
import { db } from '../database';
import { createRepo } from 'porm';

export const tagRepo = createRepo(db.tag, {
  deleteUnused(q) {
    return q.whereNotExists('articleTags').delete();
  },
});

export default {
  async listTags() {
    return await db.tag.order({ tag: 'DESC' });
  },
} as TagRepo;
