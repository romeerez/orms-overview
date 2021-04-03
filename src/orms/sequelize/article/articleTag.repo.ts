import { Tag } from 'orms/sequelize/tag/tag.model';
import { ArticleTag } from 'orms/sequelize/article/articleTag.model';
import { Transaction } from 'sequelize';

export const articleTagRepo = {
  async getTagListForArticle(article: { id: number }): Promise<string[]> {
    const tags = await Tag.findAll({
      include: [
        {
          required: true,
          model: ArticleTag as any,
          as: 'articleTags',
          where: {
            articleId: article.id,
          },
        },
      ],
    });

    return tags.map(({ tag }) => tag);
  },

  async deleteUnusedTags(tags: Tag[], transaction: Transaction) {
    const stillUsedTagObjects = await Tag.findAll({
      where: { tag: tags.map((tag) => tag.tag) },
      include: [
        {
          required: true,
          model: ArticleTag as any,
          as: 'articleTags',
        },
      ],
      transaction,
    });

    const stillUsedTags = stillUsedTagObjects.map(({ tag }) => tag);
    const notUsedTags = tags.filter(({ tag }) => !stillUsedTags.includes(tag));
    await Tag.destroy({
      where: { tag: notUsedTags.map(({ tag }) => tag) },
      transaction,
    });
  },
};
