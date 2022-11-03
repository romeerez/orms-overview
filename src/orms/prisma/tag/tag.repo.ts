import { TagRepo } from 'orms/types';
import { client } from 'orms/prisma/client';

export const tagRepo: TagRepo = {
  listTags() {
    return client.tag.findMany({
      orderBy: { tag: 'desc' },
    });
  },
};
