import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Article } from '../article/article.model';

@Entity()
export class Comment {
  @PrimaryKey() id!: number;
  @Property() authorId!: number;
  @Property() articleId!: number;
  @Property() body!: string;
  @Property() updatedAt = new Date();
  @Property() createdAt = new Date();

  constructor(params: Pick<Comment, 'authorId' | 'articleId' | 'body'>) {
    Object.assign(this, params);
  }

  @ManyToOne() article!: Article;
}
