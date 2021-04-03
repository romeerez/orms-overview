import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserArticleFavorite as UserArticleFavoriteType } from 'app/article/article.types';
import { Article } from 'orms/typeorm/article/article.model';

@Entity('userArticleFavorite')
export class UserArticleFavorite implements UserArticleFavoriteType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() userId!: number;
  @Column() articleId!: number;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'articleId' })
  article?: Article;
}
