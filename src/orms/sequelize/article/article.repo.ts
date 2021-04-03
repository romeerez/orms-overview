import { User } from 'app/user/user.types';
import { Article } from 'orms/sequelize/article/article.model';
import { Tag } from 'orms/sequelize/tag/tag.model';
import { ArticleTag } from 'orms/sequelize/article/articleTag.model';
import { db } from 'orms/sequelize/sequelize';
import slugify from 'slugify';
import { UniqueConstraintError } from 'sequelize';
import { ForbiddenError, NotFoundError, UniqueViolationError } from 'errors';
import { UserArticleFavorite } from 'orms/sequelize/article/userArticleFavorite.model';
import {
  ArticleQueryResult,
  getArticleQueryOptions,
  makeArticleForResponse,
  convertArticleQueryResultForResponse,
} from 'orms/sequelize/article/article.utils';
import { articleTagRepo } from 'orms/sequelize/article/articleTag.repo';
import { ArticleRepo } from 'orms/types';

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser?: User) {
    const options = await getArticleQueryOptions(params, currentUser);

    const { rows, count } = <{ rows: ArticleQueryResult[]; count: number }>(
      await Article.findAndCountAll({
        ...options,
        order: [['createdAt', 'DESC']],
        limit: params.limit || 20,
        offset: params.offset || 0,
      })
    );

    return {
      articles: await Promise.all(
        rows.map(convertArticleQueryResultForResponse),
      ),
      count,
    };
  },

  async getArticleBySlug(slug, currentUser) {
    const { where, include } = await getArticleQueryOptions({}, currentUser);

    const article = <ArticleQueryResult>await Article.findOne({
      where: { ...where, slug },
      include,
    });

    if (!article) throw new NotFoundError();

    return await convertArticleQueryResultForResponse(article);
  },

  async createArticle({ tagList, ...articleParams }, currentUser) {
    let article!: Article;
    await db.transaction(async (transaction) => {
      try {
        const now = new Date();
        article = await Article.create(
          {
            ...articleParams,
            authorId: currentUser.id,
            updatedAt: now,
            createdAt: now,
          },
          { transaction },
        );
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new UniqueViolationError(
            `Article with such title already exists`,
          );
        }
      }

      if (tagList.length) {
        await Promise.all(
          tagList.map(async (tagName) => {
            const [tag] = await Tag.findOrCreate({
              where: { tag: tagName },
              transaction,
            });

            await ArticleTag.create(
              { articleId: article.id, tagId: tag.id },
              { transaction },
            );
          }),
        );
      }
    });

    return await makeArticleForResponse({
      article,
      author: currentUser,
      following: false,
      favorited: false,
    });
  },

  async updateArticleBySlug(slug, { tagList, ...articleParams }, currentUser) {
    const { where, include } = await getArticleQueryOptions(
      { slug },
      currentUser,
    );

    const article = <ArticleQueryResult>await Article.findOne({
      where,
      include,
    });

    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await db.transaction(async (transaction) => {
      try {
        await article.update(
          {
            ...articleParams,
            slug: articleParams.title
              ? slugify(articleParams.title, { lower: true })
              : article.slug,
            updatedAt: new Date(),
          },
          { transaction },
        );
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new UniqueViolationError(
            `Article with such title already exists`,
          );
        }
      }

      if (tagList) {
        const currentTagObjects = <(ArticleTag & { tag: Tag })[]>(
          await ArticleTag.findAll({
            where: { articleId: article.id },
            include: 'tag',
            transaction,
          })
        );
        const currentTags = currentTagObjects.map(({ tag }) => tag);

        await ArticleTag.destroy({
          where: { articleId: article.id },
          transaction,
        });

        await Promise.all(
          tagList.map(async (tagName) => {
            let tag = currentTags.find((existing) => existing.tag === tagName);

            if (!tag)
              [tag] = await Tag.findOrCreate({
                where: { tag: tagName },
                transaction,
              });

            await ArticleTag.create(
              { articleId: article.id, tagId: tag.id },
              { transaction },
            );
          }),
        );

        const removedTags = currentTags.filter(
          (tag) => !tagList.includes(tag.tag),
        );
        await articleTagRepo.deleteUnusedTags(removedTags, transaction);
      }
    });

    return await convertArticleQueryResultForResponse(article);
  },

  async deleteArticleBySlug(slug, currentUser) {
    const article = await Article.findOne({
      where: { slug },
    });

    if (!article) throw new NotFoundError();
    if (article.authorId !== currentUser.id) throw new ForbiddenError();

    await db.transaction(async (transaction) => {
      const currentTags = await Tag.findAll({
        include: [
          {
            required: true,
            model: ArticleTag as any,
            as: 'articleTags',
            where: {
              articleId: article.id,
            },
          },
        ],
      });

      await ArticleTag.destroy({ where: { articleId: article.id } });

      await article.destroy({ transaction });

      await articleTagRepo.deleteUnusedTags(currentTags, transaction);
    });
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    const { where, include } = await getArticleQueryOptions({}, currentUser);

    const article = <ArticleQueryResult>await Article.findOne({
      where: { ...where, slug },
      include,
    });

    if (!article) throw new NotFoundError();

    try {
      await db.transaction(async (transaction) => {
        await UserArticleFavorite.create(
          {
            userId: currentUser.id,
            articleId: article.id,
          },
          { transaction },
        );

        await article.update(
          { favoritesCount: article.favoritesCount + 1 },
          { transaction },
        );
      });
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) throw error;
    }

    article.userFavoriteConnection = [{ userId: currentUser.id }];

    return await convertArticleQueryResultForResponse(article);
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    const { where, include } = await getArticleQueryOptions({}, currentUser);

    const article = <ArticleQueryResult>await Article.findOne({
      where: { ...where, slug },
      include,
    });

    if (!article) throw new NotFoundError();

    await db.transaction(async (transaction) => {
      const deletedCount = await UserArticleFavorite.destroy({
        where: {
          userId: currentUser.id,
          articleId: article.id,
        },
        transaction,
      });
      if (deletedCount > 0) {
        await article.update({ favoritesCount: article.favoritesCount - 1 });
      }
    });

    delete article.userFavoriteConnection;

    return await convertArticleQueryResultForResponse(article);
  },
};
