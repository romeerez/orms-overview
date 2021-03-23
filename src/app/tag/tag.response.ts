import { Tag } from 'app/tag/tag.types';

export const tags = (tags: Tag[]) => ({
  tags: tags.map(({ tag }) => tag),
});
