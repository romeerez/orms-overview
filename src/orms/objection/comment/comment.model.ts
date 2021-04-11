import { BaseModel } from 'orms/objection/model';
import { QueryBuilder } from 'objection';
import { User as UserType } from 'app/user/user.types';
import { selectAuthor } from 'orms/objection/profile/profile.repo';
import { Article } from 'orms/objection/article/article.model';
import { User } from 'orms/objection/user/user.model';

export class Comment extends BaseModel {
  static tableName = 'comment';

  id!: number;
  authorId!: number;
  articleId!: number;
  body!: string;
  updatedAt!: Date;
  createdAt!: Date;

  static relationMappings = {
    article: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Article,
      join: {
        from: 'comment.articleId',
        to: 'article.id',
      },
    },
    author: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'comment.authorId',
        to: 'user.id',
      },
    },
  };

  static modifiers = {
    selectAuthor(query: QueryBuilder<Comment>, currentUser?: UserType) {
      selectAuthor(query, Comment, currentUser);
    },
  };
}
