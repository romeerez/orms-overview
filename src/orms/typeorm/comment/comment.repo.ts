import { CommentRepo } from 'orms/types';
import { User as UserType } from 'app/user/user.types';
import { getRepository } from 'typeorm';
import { Comment } from 'orms/typeorm/comment/comment.model';
import { Article } from 'orms/typeorm/article/article.model';
import { buildProfileQuery } from 'orms/typeorm/profile/profile.repo';
import { ForbiddenError, NotFoundError } from 'errors';

const buildQuery = (
  params: { id?: number; articleSlug?: string },
  currentUser?: UserType,
) => {
  const repo = getRepository(Comment);

  let query = repo
    .createQueryBuilder('comment')
    .select([
      '"comment"."id"',
      '"comment"."createdAt"',
      '"comment"."updatedAt"',
      '"comment"."body"',
    ])
    .orderBy('"comment"."createdAt"', 'DESC');

  // select author
  const authorSubquery = buildProfileQuery({ query }, currentUser).andWhere(
    '"user"."id" = "comment"."authorId"',
  );

  query = query.addSelect(
    `(SELECT row_to_json(t.*) FROM (${authorSubquery.getQuery()}) t) AS "author"`,
  );

  if (params.id) {
    query = query.andWhere('"comment"."id" = :id', { id: params.id });
  }

  if (params.articleSlug) {
    query = query.innerJoin(Article, 'article', '"article"."slug" = :slug', {
      slug: params.articleSlug,
    });
  }

  return query;
};

export const commentRepo: CommentRepo = {
  articleComments(articleSlug, currentUser) {
    const query = buildQuery({ articleSlug }, currentUser);
    return query.getRawMany();
  },

  async createArticleComment(slug, params, currentUser) {
    const articleRepo = getRepository(Article);
    const article = await articleRepo.findOne({ where: { slug } });
    if (!article) throw new NotFoundError();

    const repo = getRepository(Comment);
    const newComment = repo.create({
      ...params,
      authorId: currentUser.id,
      articleId: article.id,
    });

    const { id } = await repo.save(newComment);
    const comment = await buildQuery({ id }, currentUser).getRawOne();
    if (!comment) throw new NotFoundError();
    return comment;
  },

  async deleteArticleComment(id, currentUser) {
    const repo = getRepository(Comment);
    const comment = await repo.findOne(id);
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await repo.delete(comment);
  },
};
