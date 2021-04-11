import { CommentRepo } from 'orms/types';
import { User } from 'app/user/user.types';
import { Comment } from 'orms/objection/comment/comment.model';
import { Article } from 'orms/objection/article/article.model';
import { QueryBuilder } from 'orms/objection/model';
import { CommentForResponse } from 'app/comment/comment.types';
import { ForbiddenError, NotFoundError } from 'errors';

const buildQuery = (
  params: { id?: number; articleSlug?: string },
  currentUser?: User,
) => {
  const query = Comment.query()
    .select('comment.*')
    .modify('selectAuthor', currentUser)
    .orderBy('createdAt', 'desc');

  if (params.id) query.where('comment.id', params.id);

  if (params.articleSlug) query.joinRelated(Article);

  return (query as unknown) as QueryBuilder<Comment & CommentForResponse>;
};

export const commentRepo: CommentRepo = {
  articleComments(articleSlug, currentUser) {
    return buildQuery({ articleSlug }, currentUser);
  },

  async createArticleComment(slug, params, currentUser) {
    const article = await Article.query().select('id').where({ slug }).first();
    if (!article) throw new NotFoundError();

    const { id } = await Comment.query().insert({
      ...params,
      articleId: article.id,
      authorId: currentUser.id,
    });

    return await buildQuery({ id }, currentUser).first();
  },

  async deleteArticleComment(id, currentUser) {
    const comment = await Comment.query()
      .select('authorId')
      .where({ id })
      .first();
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await Comment.query().deleteById(id);
  },
};
