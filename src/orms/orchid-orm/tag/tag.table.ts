import { BaseTable } from '../baseTable';
import { ArticleTagTable } from '../article/articleTag.table';

export class TagTable extends BaseTable {
  table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    tag: t.text(),
  }));

  relations = {
    articleTags: this.hasMany(() => ArticleTagTable, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}
