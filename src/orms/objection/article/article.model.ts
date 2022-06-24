import { Model } from 'objection';
import { db } from 'orms/objection/model';
import { User as UserType } from 'app/user/user.types';
import { User } from 'orms/objection/user/user.model';
import { QueryBuilder } from 'objection';
import { Tag } from 'orms/objection/tag/tag.model';
import { UserArticleFavorite } from 'orms/objection/article/userArticleFavorite.model';
import { selectAuthor } from 'orms/objection/profile/profile.repo';

export class Article extends Model {
  static tableName = 'article';

  id!: number;
  authorId!: number;
  slug!: string;
  title!: string;
  description!: string;
  body!: string;
  favoritesCount!: string;
  updatedAt!: string;
  createdAt!: string;

  static relationMappings = {
    author: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'article.authorId',
        to: 'user.id',
      },
    },
    userFavorites: {
      relation: Model.HasManyRelation,
      modelClass: UserArticleFavorite,
      join: {
        from: 'article.id',
        to: 'userArticleFavorite.articleId',
      },
    },
    tag: {
      relation: Model.ManyToManyRelation,
      modelClass: Tag,
      join: {
        from: 'article.id',
        through: {
          from: 'articleTag.articleId',
          to: 'articleTag.tagId',
        },
        to: 'tag.id',
      },
    },
  };

  static modifiers = {
    selectAuthor(query: QueryBuilder<Article>, currentUser?: UserType) {
      selectAuthor(query, Article, currentUser);
    },

    selectTagList(query: QueryBuilder<Article>) {
      query.select(
        Tag.query()
          .select(db.raw("coalesce(json_agg(tag ORDER BY tag.tag ASC), '[]')"))
          .join('articleTag', 'articleTag.tagId', 'tag.id')
          .where('articleTag.articleId', db.raw('article.id'))
          .as('tagList'),
      );
    },

    selectFavorited(query: QueryBuilder<Article>, currentUser?: User) {
      if (currentUser) {
        query.select(
          db.raw(
            `coalesce((${db('userArticleFavorite')
              .select(db.raw('true'))
              .where('articleId', db.raw('article.id'))
              .where('userId', currentUser.id)}), false) AS "favorited"`,
          ),
        );
      } else {
        query.select(db.raw('false AS "favorited"'));
      }
    },

    favoritedByUsername(query: QueryBuilder<Article>, username: string) {
      query
        .joinRelated('userFavorites')
        .whereExists(
          User.query()
            .select(db.raw('1'))
            .whereRaw('"user"."id" = "userFavorites"."userId"')
            .where('user.username', username),
        );
    },

    fromFollowedAuthor(query: QueryBuilder<Article>, currentUser: User) {
      query
        .innerJoin('userFollow', 'userFollow.followingId', 'author.id')
        .where('userFollow.followerId', currentUser.id);
    },
  };
}
