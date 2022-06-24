import { ArticleRepo } from 'orms/types';
import { EntityManager, In } from 'typeorm';
import { Article } from 'orms/typeorm/article/article.model';
import { Tag } from 'orms/typeorm/tag/tag.model';
import { User as UserType } from 'app/user/user.types';
import { User } from 'orms/typeorm/user/user.model';
import { UserArticleFavorite } from 'orms/typeorm/article/userArticleFavorite.model';
import { UserFollow } from 'orms/typeorm/user/userFollow.model';
import { ArticleTag } from 'orms/typeorm/article/articleTag.model';
import { ForbiddenError, NotFoundError } from 'errors';
import { buildProfileQuery } from 'orms/typeorm/profile/profile.repo';
import { dataSource } from '../dataSource';

const buildQuery = (
  params: {
    author?: string;
    tag?: string;
    favorited?: string;
    fromFollowedAuthors?: boolean;
    slug?: string;
    id?: number;
    limit?: number;
    offset?: number;
  },
  currentUser?: UserType,
) => {
  const repo = dataSource.getRepository(Article);

  let query = repo
    .createQueryBuilder('article')
    .select([
      '"article"."slug"',
      '"article"."title"',
      '"article"."description"',
      '"article"."body"',
      '"article"."createdAt"',
      '"article"."updatedAt"',
      '"article"."favoritesCount"',
    ])
    .orderBy('"article"."createdAt"', 'DESC');

  // select author
  const authorSubquery = buildProfileQuery({ query }, currentUser).andWhere(
    '"user"."id" = "article"."authorId"',
  );

  query = query.addSelect(
    `(SELECT row_to_json(t.*) FROM (${authorSubquery.getQuery()}) t) AS "author"`,
  );

  // select favorited
  if (currentUser) {
    const subquery = query
      .subQuery()
      .select('true AS "favorited"')
      .from(UserArticleFavorite, 'favorite')
      .where(
        '"favorite"."articleId" = "article"."id" AND "favorite"."userId" = :userId',
        {
          userId: currentUser.id,
        },
      );

    query.addSelect(`coalesce((${subquery.getQuery()}), false) AS "favorited"`);
  } else {
    query.addSelect('false AS "favorited"');
  }

  // select tagList
  const tagListSubquery = query
    .subQuery()
    .select('"tag"."tag"')
    .from(Tag, 'tag')
    .innerJoin(
      ArticleTag,
      'articleTag',
      '"articleTag"."tagId" = "tag"."id" AND "articleTag"."articleId" = "article"."id"',
    )
    .orderBy({ tag: 'ASC' });

  query.addSelect(
    `(SELECT coalesce(json_agg(t."tag"), '[]') FROM (${tagListSubquery.getQuery()}) t) AS "tagList"`,
  );

  // filter by tag
  if (params.tag) {
    const subquery = query
      .subQuery()
      .select('1')
      .from(Tag, 'tag')
      .innerJoin(
        ArticleTag,
        'articleTag',
        '"articleTag"."tagId" = "tag"."id" AND "articleTag"."articleId" = "article"."id"',
      )
      .where('"tag"."tag" = :tag', { tag: params.tag });

    query = query.andWhere(`EXISTS (${subquery.getQuery()})`);
  }

  // filter by author
  if (params.author) {
    const subquery = query
      .subQuery()
      .select('1')
      .from(User, 'user')
      .where(
        '"user"."id" = "article"."authorId" AND "user"."username" = :username',
        {
          username: params.author,
        },
      );

    query = query.andWhere(`EXISTS (${subquery.getQuery()})`);
  }

  // filter by favorited
  if (params.favorited) {
    const subquery = query
      .subQuery()
      .select('1')
      .from(UserArticleFavorite, 'favorite')
      .innerJoin(User, 'user', '"user"."id" = "favorite"."userId"')
      .where(
        '"favorite"."articleId" = "article"."id" AND "user"."username" = :username',
        {
          username: params.favorited,
        },
      );

    query = query.andWhere(`EXISTS (${subquery.getQuery()})`);
  }

  // filter by followed authors
  if (params.fromFollowedAuthors && currentUser) {
    const subquery = query
      .subQuery()
      .select('1')
      .from(User, 'author')
      .innerJoin(
        UserFollow,
        'follow',
        '"follow"."followingId" = "author"."id" AND "follow"."followerId" = :userId',
        {
          userId: currentUser.id,
        },
      )
      .where('"author"."id" = "article"."authorId"');

    query = query.andWhere(`EXISTS (${subquery.getQuery()})`);
  }

  // filter by slug
  if (params.slug) {
    query = query.andWhere(`"article"."slug" = :slug`, { slug: params.slug });
  }

  // filter by id
  if (params.id) {
    query = query.andWhere(`"article"."id" = :id`, { id: params.id });
  }

  query = query.limit(params.limit || 20);

  if (params.offset) query = query.offset(params.offset);

  return query;
};

const deleteUnusedTags = async (entityManager: EntityManager) => {
  await entityManager
    .createQueryBuilder()
    .delete()
    .from(Tag)
    .where(
      `NOT EXISTS (SELECT 1 FROM "articleTag" WHERE "articleTag"."tagId" = "tag"."id")`,
    )
    .execute();
};

const getArticle = async (...params: Parameters<typeof buildQuery>) => {
  const article = await buildQuery(...params).getRawOne();
  if (!article) throw new NotFoundError();
  return article;
};

const createArticleTags = async (
  entityManager: EntityManager,
  article: Article,
  isNew: boolean,
  tagList?: string[],
) => {
  if (!tagList?.length) return [];

  if (!isNew) {
    await entityManager.delete(ArticleTag, { articleId: article.id });
    await deleteUnusedTags(entityManager);
  }

  const tags = await entityManager.find(Tag, {
    where: { tag: In(tagList) },
  });

  const notExistingTags = tagList.filter(
    (name) => !tags.some(({ tag }) => tag === name),
  );

  const tagRepo = dataSource.getRepository(Tag);
  const createdTags = await entityManager.save(
    notExistingTags.map((tag) => tagRepo.create({ tag })),
  );

  const tagIds = [...tags, ...createdTags].map(({ id }) => id);
  const articleTagRepo = dataSource.getRepository(ArticleTag);
  article.articleTags = await entityManager.save(
    tagIds.map((id) =>
      articleTagRepo.create({
        articleId: article.id,
        tagId: id,
      }),
    ),
  );
};

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser) {
    const query = buildQuery(params, currentUser);

    const [articles, count] = await Promise.all([
      query.getRawMany(),
      query.getCount(),
    ]);

    return { articles, count };
  },

  async getArticleBySlug(slug, currentUser) {
    return await getArticle({ slug }, currentUser);
  },

  async createArticle(params, currentUser) {
    const repo = dataSource.getRepository(Article);

    let id = 0;
    await dataSource.transaction(async (t) => {
      const article = repo.create({ ...params, authorId: currentUser.id });

      ({ id } = <{ id: number }>await t.save(article));

      await createArticleTags(t, article, true, params.tagList);
    });

    return await getArticle({ id }, currentUser);
  },

  async updateArticleBySlug(slug, { tagList, ...params }, currentUser) {
    const repo = dataSource.getRepository(Article);
    const article = await repo.findOne({
      where: { slug },
    });

    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await dataSource.transaction(async (t) => {
      Object.assign(article, params);
      await t.save(article);
      await createArticleTags(t, article, false, tagList);
    });

    return await getArticle({ id: article.id }, currentUser);
  },

  async deleteArticleBySlug(slug, currentUser) {
    const repo = dataSource.getRepository(Article);
    const article = await repo.findOne({
      where: { slug },
    });

    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await dataSource.transaction(async (t) => {
      await t.delete(ArticleTag, { articleId: article.id });
      await t.delete(Article, article.id);
      await deleteUnusedTags(t);
    });
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    let id = 0;

    try {
      await dataSource.transaction(async (t) => {
        const repo = dataSource.getRepository(Article);
        const article = await repo.findOne({ where: { slug } });
        if (!article) throw new NotFoundError();
        id = article.id;

        const favoriteRepo = dataSource.getRepository(UserArticleFavorite);
        const favorite = favoriteRepo.create({
          articleId: id,
          userId: currentUser.id,
        });
        await t.save(favorite);

        article.favoritesCount += 1;
        await t.save(article);
      });
    } catch (error) {
      if (
        (error as { constraint: string }).constraint !==
        'userArticleFavoriteUserIdArticleIdIndex'
      )
        throw error;
    }

    return await getArticle({ id }, currentUser);
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    let id = 0;

    await dataSource.transaction(async (t) => {
      const repo = dataSource.getRepository(Article);
      const article = await repo.findOne({ where: { slug } });
      if (!article) throw new NotFoundError();
      id = article.id;

      const favoriteRepo = dataSource.getRepository(UserArticleFavorite);
      const favorite = await favoriteRepo.findOneBy({
        articleId: id,
        userId: currentUser.id,
      });
      if (!favorite) return;

      await t.delete(UserArticleFavorite, {
        articleId: id,
        userId: currentUser.id,
      });

      article.favoritesCount -= 1;
      await t.save(article);
    });

    return await getArticle({ id }, currentUser);
  },
};
