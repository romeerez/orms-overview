import { TagRepo } from '../../types';
import { Tag } from './tag.model';

export const tagRepo: TagRepo = {
  async listTags({ em }) {
    return em.find(
      Tag,
      {},
      {
        orderBy: { tag: 'DESC' },
      },
    );
  },
};
