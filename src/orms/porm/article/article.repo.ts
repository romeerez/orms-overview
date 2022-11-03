import { ArticleRepo } from '../../types';
import { db } from '../database';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { createRepo } from 'porm';
import { User } from '../../../app/user/user.types';
import { columnTypes, raw } from 'pqb';
import { tagRepo } from '../tag/tag.repo';
import { userRepo } from '../user/user.repo';

const articleRepo = createRepo(db.article, {
  defaultSelect(q, currentUser: User | undefined) {
    return q.select(
      'id',
      'slug',
      'title',
      'description',
      'body',
      'createdAt',
      'updatedAt',
      'favoritesCount',
      {
        tagList: (q) => q.tags.order('tag').pluck('tag'),
        author: (q) => userRepo(q.author).defaultSelect(currentUser),
        favorited: currentUser
          ? (q) =>
              q.userArticleFavorites.where({ userId: currentUser.id }).exists()
          : raw(columnTypes.boolean(), 'false'),
      },
    );
  },
  filterByParams(
    q,
    params: {
      tag?: string;
      author?: string;
      fromFollowedAuthors?: boolean;
      favorited?: string;
    },
    currentUser: User | undefined,
  ) {
    if (params.tag) {
      q = q.whereExists('tags', (q) => q.where({ tag: params.tag }));
    }

    if (params.author || (currentUser && params.fromFollowedAuthors)) {
      q = q.whereExists('author', (q) => {
        if (params.author) {
          q = q.where({ username: params.author });
        }

        if (currentUser && params.fromFollowedAuthors) {
          q = q.whereExists('followers', (q) =>
            q.where({ followerId: currentUser.id }),
          );
        }

        return q;
      });
    }

    if (params.favorited) {
      q = q.whereExists('userArticleFavorites', (q) =>
        q.whereExists('user', (q) => q.where({ username: params.favorited })),
      );
    }

    return q;
  },
});

export default {
  async listArticles(params, currentUser) {
    const query = articleRepo.filterByParams(params, currentUser);

    const [articles, count] = await Promise.all([
      query
        .defaultSelect(currentUser)
        .order({ createdAt: 'DESC' })
        .limit(params.limit || 20)
        .offset(params.offset),
      query.count(),
    ]);

    return { articles, count };
  },

  async getArticleBySlug(slug, currentUser) {
    const article = await articleRepo
      .defaultSelect(currentUser)
      .findByOptional({ slug });

    if (!article) throw new NotFoundError();

    return article;
  },

  async createArticle({ tagList, ...params }, currentUser) {
    const id = await db.article.get('id').insert({
      ...params,
      authorId: currentUser.id,
      articleTags: {
        create: tagList.map((tag) => ({
          tag: {
            connectOrCreate: {
              where: { tag },
              create: { tag },
            },
          },
        })),
      },
    });

    return articleRepo.find(id).defaultSelect(currentUser);
  },

  async updateArticleBySlug(slug, { tagList, ...data }, currentUser) {
    return await db.$transaction(async (db) => {
      const article = await db.article
        .findBy({ slug })
        .select('id', 'authorId', {
          tags: (q) => q.tags.select('id', 'tag'),
        });

      if (article.authorId !== currentUser.id) throw new ForbiddenError();

      const tagIdsToRemove = tagList
        ? article.tags
            .filter((tag) => !tagList.includes(tag.tag))
            .map((tag) => tag.id)
        : [];

      await db.article.find(article.id).update({
        ...data,
        articleTags: {
          create:
            tagList
              ?.filter((name) => !article.tags.some(({ tag }) => tag === name))
              .map((tag) => ({
                tag: {
                  connectOrCreate: {
                    where: { tag },
                    create: { tag },
                  },
                },
              })) || [],
          delete: { tagId: { in: tagIdsToRemove } },
        },
      });

      if (tagIdsToRemove.length) {
        await tagRepo(db.tag).whereIn('id', tagIdsToRemove).deleteUnused();
      }

      return articleRepo(db.article)
        .find(article.id)
        .defaultSelect(currentUser);
    });
  },

  async deleteArticleBySlug(slug, currentUser) {
    await db.$transaction(async (db) => {
      const article = await db.article
        .findBy({ slug })
        .select('id', 'authorId', {
          tagIds: (q) => q.articleTags.pluck('tagId'),
        });

      if (article.authorId !== currentUser.id) throw new ForbiddenError();

      await db.articleTag.where({ articleId: article.id }).delete();

      await db.article.find(article.id).delete();

      if (article.tagIds.length) {
        await tagRepo(db.tag).whereIn('id', article.tagIds).deleteUnused();
      }
    });
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    return db.$transaction(async (db) => {
      const article = await db.article.findBy({ slug }).select('id', {
        isFavorited: (q) =>
          q.userArticleFavorites.where({ userId: currentUser.id }).exists(),
      });

      if (!article.isFavorited) {
        await db.article
          .find(article.id)
          .increment('favoritesCount')
          .update({
            userArticleFavorites: {
              create: [
                {
                  userId: currentUser.id,
                },
              ],
            },
          });
      }

      return articleRepo(db.article)
        .find(article.id)
        .defaultSelect(currentUser);
    });
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    return db.$transaction(async (db) => {
      const article = await db.article.findBy({ slug }).select('id', {
        isFavorited: (q) =>
          q.userArticleFavorites.where({ userId: currentUser.id }).exists(),
      });

      if (article.isFavorited) {
        await db.article
          .find(article.id)
          .decrement('favoritesCount')
          .update({
            userArticleFavorites: {
              delete: { userId: currentUser.id },
            },
          });
      }

      return articleRepo(db.article)
        .find(article.id)
        .defaultSelect(currentUser);
    });
  },
} as ArticleRepo;
