import { Model } from 'objection';

export class ArticleTag extends Model {
  static tableName = 'articleTag';

  articleId!: number;
  tagId!: number;
}
