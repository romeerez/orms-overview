import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Comment as CommentType } from 'app/comment/comment.types';
import { Article } from 'orms/typeorm/article/article.model';

@Entity()
export class Comment implements CommentType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() authorId!: number;
  @Column() articleId!: number;
  @Column() body!: string;
  @Column() updatedAt!: Date;
  @Column() createdAt!: Date;

  @ManyToOne(() => Article, (article) => article.comments)
  article?: Article;
}
