import { Model } from 'objection';

export class UserArticleFavorite extends Model {
  static tableName = 'userArticleFavorite';

  articleId!: number;
  userId!: number;
}
