import { commentFactory } from 'tests/factories/comment.factory';
import {
  del,
  delPublic,
  getPublic,
  post,
  postPublic,
  testForbidden,
  testNotFound,
  testUnauthorized,
} from 'tests/utils/request';
import { articleFactory } from 'tests/factories/article.factory';
import { commentsSchema } from 'tests/utils/schemas';
import { randomString } from 'tests/utils/randomString';
import { userFactory } from 'tests/factories/user.factory';

describe('comment endpoints', () => {
  describe('GET /articles/:slug/comments', () => {
    it('should list article comments ordered by createdAt', async () => {
      const article = await articleFactory.create();

      const comments = await Promise.all(
        new Array(5)
          .fill(null)
          .map(() => commentFactory.create({ articleId: article.id })),
      );

      const { data } = await getPublic(`/articles/${article.slug}/comments`, {
        schema: commentsSchema,
      });

      expect(data.comments.map(({ id }) => id)).toEqual(
        comments.reverse().map(({ id }) => id),
      );
    });
  });

  describe('POST /articles/:slug/comments', () => {
    it('requires authentication', async () => {
      await testUnauthorized(postPublic('/articles/slug/comments'));
    });

    it('requires existing article', async () => {
      await testNotFound(
        post('/articles/slug/comments', {
          body: {
            comment: {
              body: 'comment body',
            },
          },
        }),
      );
    });

    it('performs validation', async () => {
      const article = await articleFactory.create();

      let { data } = await post(`/articles/${article.slug}/comments`, {
        body: {
          comment: {},
        },
      });
      expect(data.errors.body).toBe('body is a required field');

      ({ data } = await post(`/articles/${article.slug}/comments`, {
        body: {
          comment: {
            body: 'a',
          },
        },
      }));
      expect(data.errors.body).toBe('body must be at least 5 characters');

      ({ data } = await post(`/articles/${article.slug}/comments`, {
        body: {
          comment: {
            body: randomString(100001),
          },
        },
      }));
      expect(data.errors.body).toBe('body must be at most 100000 characters');
    });
  });

  describe('DELETE /articles/:slug/comments/:id', () => {
    it('requires authentication', async () => {
      await testUnauthorized(delPublic('/articles/slug/comments/1'));
    });

    it('requires id of own comment', async () => {
      const article = await articleFactory.create();
      const author = await userFactory.create();
      const comment = await commentFactory.create({
        articleId: article.id,
        authorId: author.id,
      });

      await testForbidden(
        del(`/articles/${article.slug}/comments/${comment.id}`),
      );
    });

    it('deletes comment', async () => {
      const article = await articleFactory.create();
      const comment = await commentFactory.create({ articleId: article.id });

      await del(`/articles/${article.slug}/comments/${comment.id}`);

      const { data } = await getPublic(`/articles/${article.slug}/comments`);

      expect(data.comments.length).toBe(0);
    });
  });
});
