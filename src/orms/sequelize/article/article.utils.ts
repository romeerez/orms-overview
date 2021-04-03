import { Article } from 'orms/sequelize/article/article.model';
import { User } from 'orms/sequelize/user/user.model';
import { User as UserType } from 'app/user/user.types';
import { NotFoundError, UnauthorizedError } from 'errors';
import { UserFollow } from 'orms/sequelize/user/userFollow.model';
import { UserArticleFavorite } from 'orms/sequelize/article/userArticleFavorite.model';
import Sequelize, { Op } from 'sequelize';
import {
  Article as ArticleType,
  ArticleForResponse,
} from 'app/article/article.types';
import { userToProfile } from 'app/profile/profile.mapper';
import { articleTagRepo } from 'orms/sequelize/article/articleTag.repo';

export type ArticleQueryResult = Article & {
  author: User & { followedBy?: { followerId: number }[] };
  userFavoriteConnection?: { userId: number }[];
};

export const getArticleQueryOptions = async (
  params: {
    slug?: string;
    author?: string;
    favorited?: string;
    tag?: string;
    fromFollowedAuthors?: boolean;
    limit?: number;
    offset?: number;
  },
  currentUser?: UserType,
): Promise<{ where: any; include: any }> => {
  if (params.fromFollowedAuthors && !currentUser) throw new UnauthorizedError();

  const where: any = {};

  const authorInclude: any = {
    required: true,
    model: User,
    as: 'author',
  };

  const include: any = [authorInclude];

  if (currentUser) {
    authorInclude.include = {
      required: Boolean(params.fromFollowedAuthors),
      model: UserFollow,
      as: 'followedBy',
      where: {
        followerId: currentUser.id,
      },
    };

    include.push({
      required: false,
      model: UserArticleFavorite,
      as: 'userFavoriteConnection',
      where: {
        userId: currentUser.id,
      },
    });
  }

  if (params.author) {
    where['$author.username$'] = params.author;
  }

  if (params.favorited) {
    const favoritedUser = await User.findOne({
      where: { username: params.favorited },
    });

    if (!favoritedUser) throw new NotFoundError();

    include.push({
      required: true,
      model: UserArticleFavorite,
      as: 'userFavoriteConnection2',
      where: {
        userId: favoritedUser.id,
      },
    });
  }

  if (params.tag) {
    where[Op.and] = Sequelize.literal(`
      EXISTS (
        SELECT 1
        FROM "articleTag"
        JOIN "tag"
          ON "articleId" = "Article"."id"
         AND "tagId" = "tag"."id"
         AND "tag"."tag" = '${params.tag}')
    `);
  }

  return { where, include };
};

export const makeArticleForResponse = async ({
  article,
  author,
  following,
  favorited,
}: {
  article: Article;
  author: UserType;
  following: boolean;
  favorited: boolean;
}): Promise<ArticleForResponse> => ({
  ...(<ArticleType>article.toJSON()),
  author: userToProfile(author, following),
  favorited,
  tagList: await articleTagRepo.getTagListForArticle(article),
});

export const convertArticleQueryResultForResponse = async (
  article: ArticleQueryResult,
): Promise<ArticleForResponse> => {
  const { followedBy } = article.author;
  const following = Boolean(followedBy && followedBy[0].followerId);

  const { userFavoriteConnection } = article;
  const favorited = Boolean(
    userFavoriteConnection && userFavoriteConnection[0].userId,
  );

  return await makeArticleForResponse({
    article,
    author: <UserType>article.author.toJSON(),
    following,
    favorited,
  });
};
