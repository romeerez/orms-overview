import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ArticleTag as ArticleTagType } from 'app/article/article.types';
import { Tag } from 'orms/typeorm/tag/tag.model';
import { Article } from 'orms/typeorm/article/article.model';

@Entity('articleTag')
export class ArticleTag implements ArticleTagType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() articleId!: number;
  @Column() tagId!: number;

  @ManyToOne(() => Article, (article) => article.articleTags)
  article?: Article;
}
