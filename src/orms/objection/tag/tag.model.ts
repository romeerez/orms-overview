import { BaseModel } from 'orms/objection/model';
import { ArticleTag } from 'orms/objection/article/articleTag.model';

export class Tag extends BaseModel {
  static tableName = 'tag';

  id!: number;
  tag!: string;

  static relationMappings = {
    articleTag: {
      relation: BaseModel.HasManyRelation,
      modelClass: ArticleTag,
      join: {
        from: 'tag.id',
        to: 'articleTag.tagId',
      },
    },
  };
}
