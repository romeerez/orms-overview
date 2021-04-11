import { ArticleRepo } from 'orms/types';
import { Article } from 'orms/objection/article/article.model';
import { User } from 'app/user/user.types';
import { ArticleForResponse } from 'app/article/article.types';
import { ForbiddenError, NotFoundError } from 'errors';
import { Transaction } from 'objection';
import { db } from 'orms/knex/db';
import { Tag } from 'orms/objection/tag/tag.model';
import { ArticleTag } from 'orms/objection/article/articleTag.model';
import { UserArticleFavorite } from 'orms/objection/article/userArticleFavorite.model';

const buildQuery = (
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
  const query = Article.query().joinRelated('author');

  if (params.id) query.where({ 'article.id': params.id });

  if (params.slug) query.where({ slug: params.slug });

  if (params.tag) query.joinRelated('tag').where('tag.tag', params.tag);

  if (params.author) query.where('author.username', params.author);

  if (params.favorited) query.modify('favoritedByUsername', params.favorited);

  if (params.fromFollowedAuthors && currentUser)
    query.modify('fromFollowedAuthor', currentUser);

  const countQuery = query.clone().count();

  query
    .select('article.*')
    .modify('selectAuthor', currentUser)
    .modify('selectTagList')
    .modify('selectFavorited', currentUser)
    .orderBy('createdAt', 'desc')
    .limit(params.limit || 20);

  if (params.offset) query.offset(params.offset);

  return [
    (query as unknown) as Promise<ArticleForResponse[]>,
    (countQuery as unknown) as Promise<{ count: string }[]>,
  ] as const;
};

const getArticleById = async (id: number, currentUser?: User) => {
  const [articleQuery] = buildQuery({ id, limit: 1 }, currentUser);
  const [article] = await articleQuery;
  if (!article) throw new NotFoundError();
  return article;
};

const addTagsToArticle = async (
  tr: Transaction,
  articleId: number,
  tagList?: string[],
) => {
  if (!tagList?.length) return;

  const tags = await Tag.query(tr)
    .insert(tagList.map((tag) => ({ tag })))
    .onConflict('tag')
    .merge();

  await ArticleTag.query(tr)
    .insert(tags.map((tag) => ({ articleId, tagId: tag.id })))
    .onConflict(['articleId', 'tagId'])
    .ignore();
};

const deleteUnusedTags = async (tr: Transaction, tags: { id: number }[]) => {
  if (tags.length === 0) return;

  await Tag.query(tr)
    .delete()
    .whereIn(
      'id',
      tags.map((tag) => tag.id),
    )
    .whereNotExists(
      ArticleTag.query(tr).select(db.raw('1')).where('tagId', db.raw('tag.id')),
    );
};

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser) {
    const [articlesQuery, countQuery] = buildQuery(params, currentUser);
    const [articles, [{ count }]] = await Promise.all([
      articlesQuery,
      countQuery,
    ]);
    return { articles, count: parseInt(count) };
  },

  async getArticleBySlug(slug, currentUser) {
    const [articleQuery] = buildQuery({ slug, limit: 1 }, currentUser);
    const [article] = await articleQuery;
    if (!article) throw new NotFoundError();
    return article;
  },

  async createArticle({ tagList, ...params }, currentUser) {
    const articleId = await Article.transaction(async (tr: Transaction) => {
      const article = await Article.query(tr)
        .insert({ ...params, authorId: currentUser.id })
        .returning('id');

      await addTagsToArticle(tr, article.id, tagList);

      return article.id;
    });

    return getArticleById(articleId, currentUser);
  },

  async updateArticleBySlug(slug, { tagList, ...params }, currentUser) {
    const article = await Article.query()
      .select(['id', 'authorId'])
      .where({ slug })
      .first();
    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await Article.transaction(async (tr: Transaction) => {
      if (Object.keys(params).length) await Article.query(tr).update(params);

      if (tagList) {
        const result = await Tag.query(tr)
          .select('tag.id', 'tag.tag')
          .join('articleTag', 'articleTag.tagId', 'tag.id')
          .where('articleTag.articleId', article.id);

        const removedTags = result.filter((tag) => !tagList.includes(tag.tag));

        const query = ArticleTag.query(tr)
          .where('articleId', article.id)
          .delete();

        if (tagList.length) {
          query.whereNotExists(
            Tag.query(tr)
              .select(db.raw('1'))
              .where('tag.id', db.raw('"articleTag"."tagId"'))
              .whereIn('tag.tag', tagList),
          );
        }

        await query;

        await addTagsToArticle(tr, article.id, tagList);

        await deleteUnusedTags(tr, removedTags);
      }
    });

    return getArticleById(article.id, currentUser);
  },

  async deleteArticleBySlug(slug, currentUser) {
    const article = await Article.query()
      .select(['id', 'authorId'])
      .where({ slug })
      .first();

    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await Article.transaction(async (tr) => {
      const removedTags = await Tag.query(tr)
        .select('tag.id')
        .joinRelated('articleTag')
        .where('articleTag.articleId', article.id);

      await ArticleTag.query(tr).where('articleId', article.id).delete();

      await Article.query(tr).where('id', article.id).delete();

      await deleteUnusedTags(tr, removedTags);
    });
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    const article = ((await Article.query()
      .select('id')
      .modify('selectFavorited', currentUser)
      .where({ slug })
      .first()) as unknown) as { id: number; favorited: boolean } | undefined;

    if (!article) throw new NotFoundError();

    if (!article.favorited) {
      await Article.transaction(async (tr) => {
        await UserArticleFavorite.query(tr).insert({
          articleId: article.id,
          userId: currentUser.id,
        });

        await Article.query(tr)
          .where('id', article.id)
          .increment('favoritesCount', 1);
      });
    }

    return getArticleById(article.id, currentUser);
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    const article = ((await Article.query()
      .select('id')
      .modify('selectFavorited', currentUser)
      .where({ slug })
      .first()) as unknown) as { id: number; favorited: boolean } | undefined;

    if (!article) throw new NotFoundError();

    if (article.favorited) {
      await Article.transaction(async (tr) => {
        await UserArticleFavorite.query(tr)
          .where({
            articleId: article.id,
            userId: currentUser.id,
          })
          .delete();

        await Article.query(tr)
          .where('id', article.id)
          .decrement('favoritesCount', 1);
      });
    }

    return getArticleById(article.id, currentUser);
  },
};
