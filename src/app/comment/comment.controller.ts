import { RequestHandler } from 'types';
import { object } from 'lib/yup';
import validate from 'lib/validate';
import { getCurrentUser } from 'lib/currentUser';
import { commentParams } from 'app/comment/comment.params';
import { articleParams } from 'app/article/article.params';
import * as response from 'app/comment/comment.response';
import { authUser } from 'lib/decorators';

const articleSlugParams = object({
  slug: articleParams.slug.required(),
});

export const articleComments: RequestHandler = async (request) => {
  const { slug } = validate(articleSlugParams, request.params);
  const currentUser = await getCurrentUser(request);
  const comments = await request.orm.commentRepo.articleComments(
    slug,
    currentUser,
  );
  return response.comments(comments);
};

const createParams = object({
  comment: object({
    body: commentParams.body.required(),
  }),
});

export const createArticleComment = authUser(async (request) => {
  const { slug } = validate(articleSlugParams, request.params);
  const { comment: params } = validate(createParams, request.body);
  const comment = await request.orm.commentRepo.createArticleComment(
    slug,
    params,
    request.user,
  );
  return response.comment(comment);
});

const deleteParams = object({
  slug: articleParams.slug.required(),
  id: commentParams.id.required(),
});

export const deleteArticleComment = authUser(async (request) => {
  const { id } = validate(deleteParams, request.params);
  await request.orm.commentRepo.deleteArticleComment(id, request.user);
  return null;
});
