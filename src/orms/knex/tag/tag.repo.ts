import { TagRepo } from 'orms/types';
import { db } from 'orms/knex/db';

export const tagRepo: TagRepo = {
  listTags() {
    return db('tag').orderBy('tag');
  },
};
