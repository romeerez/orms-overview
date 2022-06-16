import { ArticleRepo } from '../../types';
import { Article } from './article.model';
import { Tag } from '../tag/tag.model';
import { UserArticleFavorite } from './userArticleFavorite.model';
import { User as UserType } from '../../../app/user/user.types';
import { User } from '../user/user.model';
import { ArticleForResponse } from '../../../app/article/article.types';
import { EntityManager, QueryBuilder } from '@mikro-orm/postgresql';
import { ArticleTag } from './articleTag.model';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { buildProfileQuery } from '../profile/proflie.repo';

type ArticlesQueryParams = {
  em: EntityManager;
  currentUser?: UserType;
  query?: QueryBuilder<Article>;
  tag?: string;
  author?: string;
  favorited?: string;
  fromFollowedAuthors?: boolean;
  id?: number;
  slug?: string;
  limit?: number;
  offset?: number;
};

const buildQuery = ({
  em,
  currentUser,
  query = em.qb(Article, 'article'),
  ...params
}: ArticlesQueryParams) => {
  const knex = em.getKnex();

  const tagsQuery = em
    .qb(Tag, 'tag')
    .select(`coalesce(json_agg(tag.tag), '[]') AS "tagList"`)
    .join('articleTags', 'articleTags')
    .where({ articleTags: { articleId: knex.ref('article.id') } });

  const favoritesCountQuery = em
    .qb(UserArticleFavorite, 'favorite')
    .select(`count(*)::integer AS "favoritesCount"`)
    .where({ articleId: knex.ref('article.id') });

  const favoritedQuery =
    currentUser &&
    em
      .qb(UserArticleFavorite, 'favorited')
      .select('true::boolean')
      .where({
        articleId: knex.ref('article.id'),
        userId: knex.raw(currentUser.id),
      });

  if (params.tag) {
    query.join('tags', 'tags').where({
      tags: {
        tag: params.tag,
      },
    });
  }

  if (params.author) {
    query.join('author', 'author').where({
      author: {
        username: params.author,
      },
    });
  }

  if (params.favorited) {
    const subQuery = em
      .qb(User)
      .select('1')
      .join('userArticleFavorites', 'userArticleFavorites')
      .where({
        username: params.favorited,
        userArticleFavorites: {
          articleId: knex.ref('article.id'),
        },
      })
      .getKnexQuery();

    query.withSubQuery(subQuery, 'article.favoritedUser').where({
      'article.favoritedUser': 1,
    });
  }

  if (params.fromFollowedAuthors && currentUser) {
    const subQuery = em
      .qb(User, 'author')
      .select('1')
      .join('userFollows', 'userFollows')
      .where({
        id: knex.ref('article.authorId'),
        userFollows: {
          followingId: knex.ref('author.id'),
          followerId: currentUser.id,
        },
      })
      .getKnexQuery();

    query.withSubQuery(subQuery, 'article.followedAuthor').where({
      'article.followedAuthor': 1,
    });
  }

  if (params.id) {
    query.where({ id: params.id });
  }

  if (params.slug) {
    query.where({ slug: params.slug });
  }

  return [
    query
      .clone()
      .select(
        [
          'authorId',
          'slug',
          'title',
          'description',
          'body',
          'createdAt',
          'updatedAt',
          `(${tagsQuery.getQuery()})`,
          `(${favoritesCountQuery.getQuery()})`,
          favoritedQuery
            ? `coalesce((${favoritedQuery.getQuery()}), false) as favorited`
            : 'false::boolean as favorited',
          `(SELECT row_to_json(t.*) FROM (${buildProfileQuery({
            em,
            currentUser,
          })
            .where({ id: knex.ref('article.authorId') })
            .getQuery()}) AS t) AS author`,
        ].filter((item): item is string => !!item),
      )
      .orderBy({ createdAt: 'DESC' })
      .limit(params.limit ?? 20)
      .offset(params.offset ?? 0)
      .execute() as Promise<ArticleForResponse[]>,
    query
      .count()
      .execute('get')
      .then(({ count }) => +count),
  ] as const;
};

const getArticleForResponse = async (
  params: Omit<ArticlesQueryParams, 'limit' | 'offset'>,
) => {
  const [query] = buildQuery({
    ...params,
    limit: 1,
  });
  const [article] = await query;
  if (!article) throw new NotFoundError();
  return article;
};

const deleteUnusedTags = async (em: EntityManager) => {
  const knex = em.getKnex();
  await em
    .qb(Tag, 'tag')
    .delete()
    .where(
      `NOT EXISTS (${em
        .qb(ArticleTag)
        .select('1')
        .where({ tagId: knex.ref('tag.id') })
        .getQuery()})`,
    )
    .execute();
};

const createArticleTags = async ({
  em,
  article,
  isNew,
  tagList,
}: {
  em: EntityManager;
  article: Article;
  isNew?: boolean;
  tagList?: string[];
}) => {
  if (!tagList?.length) return [];

  if (!isNew) {
    await em.nativeDelete(ArticleTag, { articleId: article.id });
    await deleteUnusedTags(em);
  }

  const tags = await em.find(Tag, { tag: { $in: tagList } });

  const notExistingTags = tagList.filter(
    (name) => !tags.some(({ tag }) => tag === name),
  );

  const createdTags = notExistingTags.map((name) => {
    const tag = new Tag(name);
    em.persist(tag);
    return tag;
  });
  await em.flush();

  const tagIds = [...tags, ...createdTags].map(({ id }) => id);
  await Promise.all(
    tagIds.map(async (tagId) => {
      const articleTag = new ArticleTag({ tagId, articleId: article.id });
      await em.nativeInsert(articleTag);
    }),
  );
};

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser, { em }) {
    const [articles, count] = await Promise.all(
      buildQuery({
        em,
        currentUser,
        ...params,
      }),
    );

    return {
      articles,
      count,
    };
  },

  async getArticleBySlug(slug, currentUser, { em }) {
    return await getArticleForResponse({
      em,
      currentUser,
      slug,
    });
  },

  async createArticle(params, currentUser, { em }) {
    const { id } = await em.transactional(async (em) => {
      // const author = await em.findOneOrFail(User, { id: currentUser.id });
      const article = new Article({ ...params, authorId: currentUser.id });
      article.id = await em.nativeInsert(article);
      await createArticleTags({
        em,
        article,
        isNew: true,
        tagList: params.tagList,
      });
      return article;
    });
    return await getArticleForResponse({
      em,
      currentUser,
      id,
    });
  },

  async updateArticleBySlug(slug, { tagList, ...params }, currentUser, { em }) {
    const id = await em.transactional(async (em) => {
      const article = await em.findOne(Article, {
        slug,
      });

      if (!article) throw new NotFoundError();
      if (article.authorId !== currentUser.id) throw new ForbiddenError();

      Object.assign(article, params);
      em.persist(article);

      await createArticleTags({
        em,
        article,
        tagList,
      });

      return article.id;
    });

    return await getArticleForResponse({
      em,
      currentUser,
      id,
    });
  },

  async deleteArticleBySlug(slug, currentUser, { em }) {
    await em.transactional(async (em) => {
      const article = await em.findOne(Article, {
        slug,
      });

      if (!article) throw new NotFoundError();
      if (article.authorId !== currentUser.id) throw new ForbiddenError();

      await em.nativeDelete(ArticleTag, { articleId: article.id });
      await em.removeAndFlush(article);
      await deleteUnusedTags(em);

      return article.id;
    });
  },

  async markAsFavoriteBySlug(slug, currentUser, { em }) {
    const id = await em.transactional(async (em) => {
      const article = await em.findOne(Article, { slug });
      if (!article) throw new NotFoundError();

      try {
        await em.nativeInsert(
          new UserArticleFavorite({
            articleId: article.id,
            userId: currentUser.id,
          }),
        );
      } catch (error) {
        if (!(error instanceof UniqueConstraintViolationException)) throw error;
      }

      article.favoritesCount += 1;
      await em.persistAndFlush(article);

      return article.id;
    });

    return getArticleForResponse({
      em,
      currentUser,
      id,
    });
  },

  async unmarkAsFavoriteBySlug(slug, currentUser, { em }) {
    const id = await em.transactional(async (em) => {
      const article = await em.findOne(Article, { slug });
      if (!article) throw new NotFoundError();

      const count = await em.nativeDelete(UserArticleFavorite, {
        articleId: article.id,
        userId: currentUser.id,
      });

      if (count) {
        article.favoritesCount -= count;
        await em.persistAndFlush(article);
      }

      return article.id;
    });

    return getArticleForResponse({
      em,
      currentUser,
      id,
    });
  },
};
