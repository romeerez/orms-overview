import { BaseModel } from 'orms/objection/model';

export class ArticleTag extends BaseModel {
  static tableName = 'articleTag';

  articleId!: number;
  tagId!: number;
}
