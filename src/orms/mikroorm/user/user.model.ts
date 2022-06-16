import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Article } from '../article/article.model';
import { UserFollow } from './userFollow.model';
import { UserArticleFavorite } from '../article/userArticleFavorite.model';

@Entity()
export class User {
  @PrimaryKey() id!: number;
  @Property() email!: string;
  @Property() username!: string;
  @Property() password!: string;
  @Property() bio?: string;
  @Property() image?: string;

  @OneToMany(() => Article, (article) => article.author)
  articles = new Collection<Article>(this);

  @OneToMany(() => UserFollow, (follow) => follow.following)
  userFollows = new Collection<UserFollow>(this);

  @OneToMany({
    entity: () => UserArticleFavorite,
    mappedBy: (record) => record.user,
  })
  userArticleFavorites = new Collection<UserArticleFavorite>(this);
}
