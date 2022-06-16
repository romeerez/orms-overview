import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Article } from '../article/article.model';
import { ArticleTag } from '../article/articleTag.model';

@Entity()
export class Tag {
  @PrimaryKey() id!: number;
  @Property() tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  @OneToMany({ entity: () => ArticleTag, mappedBy: 'tag' })
  articleTags = new Collection<ArticleTag>(this);

  @ManyToMany({ entity: () => Article, mappedBy: 'tags' })
  articles = new Collection<Article>(this);
}
