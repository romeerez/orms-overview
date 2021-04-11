import { BaseModel } from 'orms/objection/model';

export class UserArticleFavorite extends BaseModel {
  static tableName = 'userArticleFavorite';

  articleId!: number;
  userId!: number;
}
