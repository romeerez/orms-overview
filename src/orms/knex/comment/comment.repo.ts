import { CommentRepo } from 'orms/types';
import { User } from 'app/user/user.types';
import { db } from 'orms/knex/db';
import { buildProfileQuery } from 'orms/knex/profile/profile.repo';
import { ForbiddenError, NotFoundError } from 'errors';

const buildQuery = (
  params: { id?: number; articleSlug?: string },
  currentUser?: User,
) => {
  const query = db('comment').select('comment.*').orderBy('createdAt', 'desc');

  buildProfileQuery({ query, joinForeignKey: 'comment.authorId' }, currentUser);

  if (params.id) query.where('comment.id', params.id);

  if (params.articleSlug)
    query.join('article', 'article.id', 'comment.articleId');

  return query;
};

export const commentRepo: CommentRepo = {
  articleComments(articleSlug, currentUser) {
    return buildQuery({ articleSlug }, currentUser);
  },

  async createArticleComment(slug: string, params, currentUser) {
    const article = await db('article').select('id').where({ slug }).first();
    if (!article) throw new NotFoundError();

    const { id } = await db('comment')
      .insert({ ...params, articleId: article.id, authorId: currentUser.id })
      .returning('id');

    return await buildQuery({ id }, currentUser).first();
  },

  async deleteArticleComment(id, currentUser) {
    const comment = await db('comment')
      .select('authorId')
      .where({ id })
      .first();
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await db('comment').where({ id }).delete();
  },
};
