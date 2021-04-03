import { Tag } from 'orms/sequelize/tag/tag.model';

export const tagRepo = {
  async listTags() {
    return await Tag.findAll();
  },
};
