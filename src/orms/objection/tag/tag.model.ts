import { ArticleTag } from 'orms/objection/article/articleTag.model';
import { Model } from 'objection';

export class Tag extends Model {
  static tableName = 'tag';

  id!: number;
  tag!: string;

  static relationMappings = {
    articleTag: {
      relation: Model.HasManyRelation,
      modelClass: ArticleTag,
      join: {
        from: 'tag.id',
        to: 'articleTag.tagId',
      },
    },
  };
}
