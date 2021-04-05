import { ArticleRepo } from 'orms/types';
import { db } from 'orms/knex/db';
import { User } from 'app/user/user.types';
import { ForbiddenError, NotFoundError } from 'errors';
import { Knex } from 'knex';
import { buildProfileQuery } from 'orms/knex/profile/profile.repo';

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
  const query = db('article').select(
    'article.*',
    db('tag')
      .select(db.raw("coalesce(json_agg(tag), '[]')"))
      .join('articleTag', 'articleTag.tagId', 'tag.id')
      .where('articleTag.articleId', db.raw('article.id'))
      .as('tagList'),
  );

  buildProfileQuery({ query, joinForeignKey: 'article.authorId' }, currentUser);

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

  if (params.id) {
    query.where('article.id', params.id);
  }

  if (params.slug) {
    query.where('article.slug', params.slug);
  }

  if (params.author) {
    query.where('user.username', params.author);
  }

  if (params.tag) {
    query.whereExists(
      db('tag')
        .select(db.raw('1'))
        .join('articleTag', 'articleTag.tagId', 'tag.id')
        .where('articleId', db.raw('article.id'))
        .where('tag.tag', params.tag),
    );
  }

  if (params.favorited) {
    query.whereExists(
      db('userArticleFavorite')
        .select(db.raw('1'))
        .join('user', 'user.id', 'userId')
        .where('articleId', db.raw('article.id'))
        .where('user.username', params.favorited),
    );
  }

  if (params.fromFollowedAuthors && currentUser) {
    query
      .join('userFollow', 'followingId', 'user.id')
      .where('followerId', currentUser.id);
  }

  const countQuery = query.clone().clearSelect().count();

  if (!params.id && !params.slug)
    query
      .orderBy('createdAt', 'desc')
      .limit(params.limit || 20)
      .offset(params.offset || 0);

  return [query, countQuery];
};

const addTagsToArticle = async (
  tr: Knex.Transaction<any, any[]>,
  articleId: number,
  tagList?: string[],
) => {
  if (!tagList?.length) return;

  const tagIds = await tr('tag')
    .insert(tagList.map((tag) => ({ tag })))
    .onConflict('tag')
    .merge()
    .returning('id');

  await tr('articleTag')
    .insert(tagIds.map((tagId) => ({ articleId, tagId })))
    .onConflict(['articleId', 'tagId'])
    .ignore();
};

const deleteUnusedTags = async (
  tr: Knex.Transaction<any, any[]>,
  tags: { id: number }[],
) => {
  if (tags.length === 0) return;

  await tr('tag')
    .delete()
    .whereIn(
      'id',
      tags.map((tag) => tag.id),
    )
    .whereNotExists(
      db('articleTag').select(db.raw('1')).where('tagId', db.raw('tag.id')),
    );
};

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser) {
    const [query, countQuery] = buildQuery(params, currentUser);
    const [articles, [{ count }]] = await Promise.all([query, countQuery]);
    return { articles, count: parseInt(count as string) };
  },

  async getArticleBySlug(slug, currentUser) {
    const [query] = buildQuery({ slug }, currentUser);
    const article = await query.first();
    if (!article) throw new NotFoundError();
    return article;
  },

  async createArticle({ tagList, ...params }, currentUser) {
    let articleId = 0;

    await db.transaction(async (tr) => {
      try {
        const result = await tr('article')
          .insert({ ...params, authorId: currentUser.id })
          .returning('id');

        articleId = result[0];

        await addTagsToArticle(tr, articleId, tagList);

        await tr.commit();
      } catch (error) {
        await tr.rollback();
        throw error;
      }
    });

    const [query] = buildQuery({ id: articleId }, currentUser);
    return await query.first();
  },

  async updateArticleBySlug(slug, { tagList, ...params }, currentUser) {
    const article = await db('article')
      .select('id', 'authorId')
      .where({ slug })
      .first();
    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await db.transaction(async (tr) => {
      try {
        if (Object.keys(params).length) await tr('article').update(params);

        if (tagList) {
          const result = await tr('tag')
            .select('tag.id', 'tag.tag')
            .join('articleTag', 'articleTag.tagId', 'tag.id')
            .where('articleTag.articleId', article.id);

          const removedTags = result.filter(
            (tag) => !tagList.includes(tag.tag),
          );

          const query = tr('articleTag')
            .delete()
            .where('articleId', article.id);

          if (tagList.length) {
            query.whereNotExists(
              db('tag')
                .select(db.raw('1'))
                .where('tag.id', db.raw('"articleTag"."tagId"'))
                .whereIn('tag.tag', tagList),
            );
          }

          await query;

          await addTagsToArticle(tr, article.id, tagList);

          await deleteUnusedTags(tr, removedTags);
        }

        await tr.commit();
      } catch (error) {
        await tr.rollback();
        throw error;
      }
    });

    const [query] = buildQuery({ id: article.id }, currentUser);
    return await query.first();
  },

  async deleteArticleBySlug(slug, currentUser) {
    const article = await db('article')
      .select('id', 'authorId')
      .where({ slug })
      .first();

    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await db.transaction(async (tr) => {
      try {
        const removedTags = await tr('tag')
          .select('tag.id')
          .join('articleTag', 'articleTag.tagId', 'tag.id')
          .where('articleTag.articleId', article.id);

        await tr('articleTag').where('articleId', article.id).delete();

        await tr('article').where('id', article.id).delete();

        await deleteUnusedTags(tr, removedTags);

        await tr.commit();
      } catch (error) {
        await tr.rollback();
        throw error;
      }
    });
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    const article = await db('article')
      .select('id', 'authorId')
      .where({ slug })
      .first();

    if (!article) throw new NotFoundError();

    const exists = await db('userArticleFavorite')
      .select(db.raw('1'))
      .where({ articleId: article.id, userId: currentUser.id })
      .first();

    if (!exists) {
      await db.transaction(async (tr) => {
        try {
          await tr('userArticleFavorite').insert({
            articleId: article.id,
            userId: currentUser.id,
          });
          await tr('article')
            .where('id', article.id)
            .increment('favoritesCount');

          await tr.commit();
        } catch (error) {
          await tr.rollback();
          throw error;
        }
      });
    }

    const [query] = buildQuery({ id: article.id }, currentUser);
    return await query.first();
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    const article = await db('article')
      .select('id', 'authorId')
      .where({ slug })
      .first();

    if (!article) throw new NotFoundError();

    const exists = await db('userArticleFavorite')
      .select(db.raw('1'))
      .where({ articleId: article.id, userId: currentUser.id })
      .first();

    if (exists) {
      await db.transaction(async (tr) => {
        try {
          await tr('userArticleFavorite').delete().where({
            articleId: article.id,
            userId: currentUser.id,
          });
          await tr('article')
            .where('id', article.id)
            .decrement('favoritesCount');

          await tr.commit();
        } catch (error) {
          await tr.rollback();
          throw error;
        }
      });
    }

    const [query] = buildQuery({ id: article.id }, currentUser);
    return await query.first();
  },
};
