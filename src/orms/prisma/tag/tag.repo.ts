import { TagRepo } from 'orms/types';
import { client } from 'orms/prisma/client';

export const tagRepo: TagRepo = {
  async listTags() {
    const tags = await client.tag.findMany({
      orderBy: { tag: 'desc' },
    });
    return tags;
  },
};
