import { Model } from '../model';
import { ArticleTagModel } from '../article/articleTag.model';

export class TagModel extends Model {
  table = 'tag';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    tag: t.text(),
  }));

  relations = {
    articleTags: this.hasMany(() => ArticleTagModel, {
      required: true,
      primaryKey: 'id',
      foreignKey: 'tagId',
    }),
  };
}
