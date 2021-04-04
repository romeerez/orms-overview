import { CommentRepo } from 'orms/types';
import { User } from 'app/user/user.types';
import {
  getProfileQueryOptions,
  mapProfileResult,
  ProfileResult,
} from 'orms/prisma/profile/profile.repo';
import { Comment, CommentForResponse } from 'app/comment/comment.types';
import { client } from 'orms/prisma/client';
import { ForbiddenError, NotFoundError } from 'errors';

type CommentResult = Pick<
  Comment,
  'id' | 'createdAt' | 'updatedAt' | 'body'
> & {
  user: ProfileResult;
};

const mapCommentResult = (comment: CommentResult): CommentForResponse => ({
  ...comment,
  author: mapProfileResult(comment.user),
});

const getQueryOptions = (
  params: { articleSlug?: string },
  currentUser?: User,
) => {
  return {
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      body: true,
      user: {
        ...getProfileQueryOptions(currentUser),
      },
    },
    where: {
      article: {
        slug: params.articleSlug,
      },
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  };
};

export const commentRepo: CommentRepo = {
  async articleComments(articleSlug, currentUser) {
    const queryOptions = getQueryOptions({ articleSlug }, currentUser);
    const comments = await client.comment.findMany(queryOptions);
    return comments.map(mapCommentResult);
  },

  async createArticleComment(slug, params, currentUser) {
    const article = await client.article.findUnique({ where: { slug } });
    if (!article) throw new NotFoundError();

    const { id } = await client.comment.create({
      data: {
        ...params,
        authorId: currentUser.id,
        articleId: article.id,
      },
    });

    const { orderBy, ...queryOptions } = getQueryOptions({}, currentUser);
    const comment = await client.comment.findUnique({
      ...queryOptions,
      where: { id },
    });
    if (!comment) throw new NotFoundError();
    return mapCommentResult(comment);
  },

  async deleteArticleComment(id, currentUser) {
    const comment = await client.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await client.comment.delete({
      where: { id },
    });
  },
};
