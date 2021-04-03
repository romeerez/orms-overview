import { TagRepo } from 'orms/types';
import { getRepository } from 'typeorm';
import { Tag } from 'orms/typeorm/tag/tag.model';

export const tagRepo: TagRepo = {
  listTags() {
    const repo = getRepository(Tag);
    return repo.find({
      order: {
        tag: 'DESC',
      },
    });
  },
};
