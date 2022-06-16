import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Article } from './article.model';
import { User } from '../user/user.model';

@Entity()
export class UserArticleFavorite {
  static tableName = 'userArticleFavorite';

  @PrimaryKey() id!: number;
  @Property() userId!: number;
  @Property() articleId!: number;

  constructor(params: Pick<UserArticleFavorite, 'articleId' | 'userId'>) {
    Object.assign(this, params);
  }

  @ManyToOne() article!: Article;
  @ManyToOne() user!: User;
}
