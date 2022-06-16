import { CommentRepo } from '../../types';
import { Comment } from './comment.model';
import { buildProfileQuery } from '../profile/proflie.repo';
import { User as UserType } from '../../../app/user/user.types';
import { Article } from '../article/article.model';
import { EntityManager } from '@mikro-orm/postgresql';
import { ForbiddenError, NotFoundError } from '../../../errors';

const buildQuery = ({
  em,
  currentUser,
  ...params
}: {
  em: EntityManager;
  id?: number;
  articleSlug?: string;
  currentUser?: UserType;
}) => {
  const knex = em.getKnex();

  const query = em
    .qb(Comment, 'comment')
    .select([
      'id',
      'createdAt',
      'updatedAt',
      'body',
      `(SELECT row_to_json(t.*) FROM (${buildProfileQuery({ em, currentUser })
        .where({ id: knex.ref('comment.authorId') })
        .getQuery()}) AS t) AS author`,
    ])
    .orderBy({ createdAt: 'DESC' });

  if (params.id) {
    query.where({ id: params.id });
  }

  if (params.articleSlug) {
    query
      .join('article', 'article')
      .where({ article: { slug: params.articleSlug } });
  }

  return query;
};

export const commentRepo: CommentRepo = {
  async articleComments(articleSlug, currentUser, { em }) {
    const query = buildQuery({ em, articleSlug, currentUser });
    return await query.execute();
  },

  async createArticleComment(slug, params, currentUser, { em }) {
    const article = await em.findOne(Article, { slug });
    if (!article) throw new NotFoundError();

    const id = await em.nativeInsert(
      new Comment({
        ...params,
        authorId: currentUser.id,
        articleId: article.id,
      }),
    );

    const query = buildQuery({ em, id, currentUser });
    return await query.execute('get');
  },

  async deleteArticleComment(id, currentUser, { em }) {
    const comment = await em.findOne(Comment, { id });
    if (!comment) throw new NotFoundError();
    if (comment.authorId !== currentUser.id) throw new ForbiddenError();

    await em.removeAndFlush(comment);
  },
};
