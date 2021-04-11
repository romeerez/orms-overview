import { TagRepo } from 'orms/types';
import { Tag } from 'orms/objection/tag/tag.model';

export const tagRepo: TagRepo = {
  async listTags() {
    return Tag.query().orderBy('tag.tag');
  },
};
