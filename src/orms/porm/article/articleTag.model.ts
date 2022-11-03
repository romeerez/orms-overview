import { Model } from '../model';
import { TagModel } from '../tag/tag.model';
import { ArticleModel } from './article.model';

export class ArticleTagModel extends Model {
  table = 'articleTag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    articleId: t.integer().primaryKey().index(),
    tagId: t
      .integer()
      .foreignKey(() => TagModel, 'id')
      .index(),
    ...t.unique(['articleId', 'tagId']),
  }));

  relations = {
    article: this.belongsTo(() => ArticleModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    tag: this.belongsTo(() => TagModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}
