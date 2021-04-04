import { ArticleRepo } from 'orms/types';
import { client } from 'orms/prisma/client';
import { Article, ArticleForResponse } from 'app/article/article.types';
import { User } from 'app/user/user.types';
import { ForbiddenError, NotFoundError } from 'errors';
import {
  getProfileQueryOptions,
  mapProfileResult,
  ProfileResult,
} from 'orms/prisma/profile/profile.repo';

type ArticleResult = Pick<
  Article,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'body'
  | 'favoritesCount'
  | 'updatedAt'
  | 'createdAt'
> & {
  user: ProfileResult;
  articleTag: { tag: { tag: string } }[];
  userArticleFavorite?: { articleId: number }[];
};

const mapArticleResult = (article: ArticleResult): ArticleForResponse => ({
  ...article,
  author: mapProfileResult(article.user),
  tagList: article.articleTag.map(({ tag }) => tag.tag).sort(),
  favorited: Boolean(article.userArticleFavorite?.length),
});

const getQueryOptions = (
  params: {
    id?: number;
    slug?: string;
    author?: string;
    favorited?: string;
    tag?: string;
    fromFollowedAuthors?: boolean;
    limit?: number;
    offset?: number;
  },
  currentUser?: User,
) => {
  const userWhere: any = {};

  if (params.author) {
    userWhere.username = params.author;
  }

  if (params.fromFollowedAuthors && currentUser) {
    userWhere.userFollow_userTouserFollow_followingId = {
      some: {
        followerId: currentUser.id,
      },
    };
  }

  const where = {
    id: params.id,
    slug: params.slug,
    user: params.author || params.fromFollowedAuthors ? userWhere : undefined,

    articleTag: params.tag
      ? {
          some: {
            tag: {
              tag: params.tag,
            },
          },
        }
      : undefined,

    userArticleFavorite: params.favorited
      ? {
          some: {
            user: {
              username: params.favorited,
            },
          },
        }
      : undefined,
  };

  return {
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      body: true,
      favoritesCount: true,
      updatedAt: true,
      createdAt: true,
      user: {
        ...getProfileQueryOptions(currentUser),
      },
      articleTag: {
        select: {
          tag: {
            select: {
              tag: true,
            },
          },
        },
      },
      userArticleFavorite: currentUser
        ? {
            select: {
              articleId: true,
            },
            where: {
              userId: currentUser.id,
            },
          }
        : false,
    },
    where,
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: params.limit || 20,
    skip: params.offset || 0,
  };
};

const deleteUnusedTags = async (ids: number[]) => {
  if (ids.length === 0) return;

  const usedTags = await client.tag.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      articleTag: true,
    },
  });

  await client.tag.deleteMany({
    where: {
      id: {
        in: ids.filter(
          (id) =>
            !usedTags.some((tag) => tag.id === id && tag.articleTag.length),
        ),
      },
    },
  });
};

const getArticleById = async (id: number, currentUser?: User) => {
  const { orderBy, take, skip, ...queryOptions } = getQueryOptions(
    { id },
    currentUser,
  );
  const article = await client.article.findUnique(queryOptions);
  if (!article) throw new NotFoundError();
  return mapArticleResult(article);
};

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser) {
    const queryOptions = getQueryOptions(params, currentUser);

    const articlesPromise = client.article.findMany(queryOptions);

    const countPromise = client.article.count({ where: queryOptions.where });

    const [articles, count] = await Promise.all([
      articlesPromise,
      countPromise,
    ]);

    return {
      articles: articles.map(mapArticleResult),
      count,
    } as any;
  },

  async getArticleBySlug(slug, currentUser) {
    const { orderBy, take, skip, ...queryOptions } = getQueryOptions(
      { slug },
      currentUser,
    );
    const article = await client.article.findUnique(queryOptions);
    if (!article) throw new NotFoundError();
    return mapArticleResult(article);
  },

  async createArticle({ tagList, ...params }, currentUser) {
    const { id } = await client.article.create({
      data: {
        ...params,
        authorId: currentUser.id,
        articleTag: {
          create: tagList.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { tag },
                create: { tag },
              },
            },
          })),
        },
      },
    });

    return await getArticleById(id, currentUser);
  },

  async updateArticleBySlug(slug, { tagList, ...data }, currentUser) {
    const article = await client.article.findUnique({
      where: { slug },
      select: { authorId: true },
    });
    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    const articleTags = await client.articleTag.findMany({
      where: { article: { slug } },
      select: {
        tag: true,
      },
    });

    const tagIdsToRemove = tagList
      ? articleTags
          .filter(({ tag }) => !tagList.includes(tag.tag))
          .map(({ tag }) => tag.id)
      : [];

    const { id } = await client.article.update({
      where: { slug },
      data: {
        ...data,
        articleTag: {
          create:
            tagList
              ?.filter(
                (name) => !articleTags.some(({ tag }) => tag.tag === name),
              )
              .map((tag) => ({
                tag: {
                  connectOrCreate: {
                    where: { tag },
                    create: { tag },
                  },
                },
              })) || [],
          deleteMany: tagIdsToRemove.map((id) => ({ tagId: id })),
        },
      },
    });

    await deleteUnusedTags(tagIdsToRemove);

    return await getArticleById(id, currentUser);
  },

  async deleteArticleBySlug(slug, currentUser) {
    const article = await client.article.findUnique({
      where: { slug },
      select: {
        id: true,
        authorId: true,
        articleTag: { select: { tagId: true } },
      },
    });
    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await client.articleTag.deleteMany({
      where: {
        articleId: article.id,
      },
    });

    await client.article.delete({
      where: {
        id: article.id,
      },
    });

    await deleteUnusedTags(article.articleTag.map((tag) => tag.tagId));
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    const article = await client.article.findUnique({ where: { slug } });
    if (!article) throw new NotFoundError();

    const favorite = await client.userArticleFavorite.findFirst({
      where: { articleId: article.id, userId: currentUser.id },
    });
    if (!favorite) {
      await client.article.update({
        where: {
          id: article.id,
        },
        data: {
          favoritesCount: article.favoritesCount + 1,
          userArticleFavorite: {
            create: {
              userId: currentUser.id,
            },
          },
        },
      });
    }

    return await getArticleById(article.id, currentUser);
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    const article = await client.article.findUnique({ where: { slug } });
    if (!article) throw new NotFoundError();

    const favorite = await client.userArticleFavorite.findFirst({
      where: { articleId: article.id, userId: currentUser.id },
    });
    if (favorite) {
      await client.article.update({
        where: {
          id: article.id,
        },
        data: {
          favoritesCount: article.favoritesCount - 1,
          userArticleFavorite: {
            deleteMany: {
              userId: currentUser.id,
            },
          },
        },
      });
    }

    return await getArticleById(article.id, currentUser);
  },
};
