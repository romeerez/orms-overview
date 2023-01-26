import { BaseTable } from '../baseTable';
import { TagTable } from '../tag/tag.table';
import { ArticleTable } from './article.table';

export class ArticleTagTable extends BaseTable {
  table = 'articleTag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    articleId: t.integer().primaryKey().index(),
    tagId: t
      .integer()
      .foreignKey(() => TagTable, 'id')
      .index(),
    ...t.unique(['articleId', 'tagId']),
  }));

  relations = {
    article: this.belongsTo(() => ArticleTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'articleId',
    }),

    tag: this.belongsTo(() => TagTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}
