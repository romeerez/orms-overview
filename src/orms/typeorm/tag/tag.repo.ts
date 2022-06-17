import { TagRepo } from 'orms/types';
import { Tag } from 'orms/typeorm/tag/tag.model';
import { dataSource } from '../dataSource';

export const tagRepo: TagRepo = {
  listTags() {
    const repo = dataSource.getRepository(Tag);
    return repo.find({
      order: {
        tag: 'DESC',
      },
    });
  },
};
