import {
  Entity,
  ManyToOne,
  OneToMany,
  Collection,
  PrimaryKey,
  Property,
  ManyToMany,
} from '@mikro-orm/core';
import { User } from '../user/user.model';
import { ArticleTag } from './articleTag.model';
import { Tag } from '../tag/tag.model';
import { UserArticleFavorite } from './userArticleFavorite.model';

@Entity()
export class Article {
  @PrimaryKey() id!: number;
  @Property() authorId!: number;
  @Property() slug!: string;
  @Property() title!: string;
  @Property() description!: string;
  @Property() body!: string;
  @Property() favoritesCount!: number;
  @Property() updatedAt = new Date();
  @Property() createdAt = new Date();

  constructor(
    params: Pick<
      Article,
      'slug' | 'title' | 'description' | 'body' | 'authorId'
    >,
  ) {
    Object.assign(this, params);
  }

  tagList!: string[];

  @ManyToOne({ entity: () => User, inversedBy: (user) => user.articles })
  author!: User;
  @OneToMany(() => ArticleTag, (tag) => tag.article)
  articleTags = new Collection<ArticleTag>(this);

  @OneToMany({
    entity: () => UserArticleFavorite,
    mappedBy: (record) => record.article,
  })
  userArticleFavorites = new Collection<UserArticleFavorite>(this);

  @ManyToMany({ entity: () => Tag, inversedBy: 'articles' })
  tags = new Collection<Tag>(this);
}
