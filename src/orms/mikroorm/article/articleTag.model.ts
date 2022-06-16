import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Article } from './article.model';
import { Tag } from '../tag/tag.model';

@Entity()
export class ArticleTag {
  @PrimaryKey() id!: number;
  @Property() articleId!: number;
  @Property() tagId!: number;

  constructor(params: Pick<ArticleTag, 'articleId' | 'tagId'>) {
    Object.assign(this, params);
  }

  @ManyToOne() article!: Article;
  @ManyToOne() tag!: Tag;
}
