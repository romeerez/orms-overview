import { ArticleRepo } from '../../types';
import { User } from '../../../app/user/user.types';
import { db } from '../db';
// import { sql } from 'kysely';

const buildQuery = (
  params: {
    id?: number;
  },
  currentUser?: User,
) => {
  const query = db.selectFrom('article').select([
    'article.id',
    'article.authorId',
    'article.slug',
    'article.title',
    'article.description',
    'article.body',
    'article.favoritesCount',
    'article.updatedAt',
    'article.updatedAt',
    'article.createdAt',
    // cannot do sub query
    // sql(db.selectFrom('tag')).as('tagList'),
  ]);
};

export const articleRepo: ArticleRepo = {
  async listArticles(params, currentUser) {
    return {} as any;
  },

  async getArticleBySlug(slug, currentUser) {
    return {} as any;
  },

  async createArticle({ tagList, ...params }, currentUser) {
    return {} as any;
  },

  async updateArticleBySlug(slug, { tagList, ...params }, currentUser) {
    return {} as any;
  },

  async deleteArticleBySlug(slug, currentUser) {
    return {} as any;
  },

  async markAsFavoriteBySlug(slug, currentUser) {
    return {} as any;
  },

  async unmarkAsFavoriteBySlug(slug, currentUser) {
    return {} as any;
  },
};
