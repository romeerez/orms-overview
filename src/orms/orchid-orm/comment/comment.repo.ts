import { CommentRepo } from '../../types';
import { db } from '../database';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { User } from '../../../app/user/user.types';
import { columnTypes, raw } from 'pqb';
import { createRepo } from 'orchid-orm';

export const commentRepo = createRepo(db.comment, {
  queryMethods: {
    defaultSelect(q, currentUser: User | undefined) {
      return q.select('id', 'body', 'createdAt', 'updatedAt', {
        author: (q) =>
          q.author.select('username', 'bio', 'image', {
            following: currentUser
              ? (q) =>
                  q.followers.where({ followerId: currentUser.id }).exists()
              : db.comment.raw((t) => t.boolean(), 'false'),
          }),
      });
    },
    filterBySlug(q, slug: string) {
      return q.join('article', (q) => q.where({ slug }));
    },
  },
});

export default {
  async articleComments(slug, currentUser) {
    return await commentRepo
      .defaultSelect(currentUser)
      .filterBySlug(slug)
      .order({ createdAt: 'DESC' });
  },

  async createArticleComment(slug, params, currentUser) {
    const article = await db.article.findByOptional({ slug });
    if (!article) throw new NotFoundError();

    const id = await db.comment.get('id').create({
      ...params,
      authorId: currentUser.id,
      articleId: article.id,
    });

    return commentRepo.defaultSelect(currentUser).find(id);
  },

  async deleteArticleComment(id, currentUser) {
    const comment = await db.comment.findOptional(id);
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await db.comment.find(id).delete();
  },
} as CommentRepo;
