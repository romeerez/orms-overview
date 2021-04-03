import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Article as ArticleType } from 'app/article/article.types';
import { User } from 'orms/typeorm/user/user.model';
import { Tag } from 'orms/typeorm/tag/tag.model';
import { ArticleTag } from 'orms/typeorm/article/articleTag.model';
import { Comment } from 'orms/typeorm/comment/comment.model';

@Entity()
export class Article implements ArticleType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() authorId!: number;
  @Column() slug!: string;
  @Column() title!: string;
  @Column() description!: string;
  @Column() body!: string;
  @Column() favoritesCount!: number;
  @Column() updatedAt!: Date;
  @Column() createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.article)
  @JoinColumn({ name: 'articleId' })
  articleTags?: ArticleTag[];

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'articleTag',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags?: Tag[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'userArticleFavorite',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  favoritedUsers?: User[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments?: Comment;
}
