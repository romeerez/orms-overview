import {
  del,
  delPublic,
  get,
  getPublic,
  post,
  postPublic,
  put,
  putPublic,
  testNotFound,
  testUnauthorized,
} from 'tests/utils/request';
import { articleFactory } from 'tests/factories/article.factory';
import { articlesSchema, articleSchema } from 'tests/utils/schemas';
import { currentUser, userFactory } from 'tests/factories/user.factory';
import { randomString } from 'tests/utils/randomString';
import { ArticleForResponse } from 'app/article/article.types';
import { clearDatabase } from 'tests/utils/for-prisma';
import { db } from 'tests/utils/db';

describe('articles endpoints', () => {
  beforeEach(async () => {
    if (process.env.ORM !== 'prisma') return;

    await db.query(`DELETE FROM "articleTag"`);
    await db.query(`DELETE FROM "userArticleFavorite"`);
    await db.query(`DELETE FROM "article"`);
    await db.query(`DELETE FROM "tag"`);
    await db.query('DELETE FROM "userFollow"');
    await db.query(
      `DELETE FROM "user" WHERE "email" != '${currentUser.email}'`,
    );
  });

  clearDatabase();

  describe('GET /articles', () => {
    it('should list all articles ordered by createdAt, default limit is 20', async () => {
      await Promise.all(
        new Array(21).fill(null).map(() => articleFactory.create()),
      );

      const { data } = await getPublic('/articles', { schema: articlesSchema });

      expect(data.articlesCount).toEqual(21);
      expect(data.articles.length).toEqual(20);
      expect(
        data.articles.some(
          ({ author }: ArticleForResponse) => author.following,
        ),
      ).toBe(false);
      expect(
        data.articles.some(({ favorited }: ArticleForResponse) => favorited),
      ).toBe(false);
    });

    it('should list articles with correct tags', async () => {
      const first = await articleFactory.create({
        tagList: ['apple', 'orange'],
      });
      const second = await articleFactory.create({ tagList: ['coconut'] });

      const { data } = await getPublic('/articles', { schema: articlesSchema });

      expect(data.articlesCount).toEqual(2);
      expect(data.articles[0].tagList).toEqual(second.tagList);
      expect(data.articles[1].tagList).toEqual(first.tagList);
    });

    it('should list all articles with correct favorited field', async () => {
      await articleFactory.create();
      await articleFactory.create(
        {},
        { transient: { favorited: [currentUser] } },
      );

      const { data } = await get('/articles', { schema: articlesSchema });

      expect(
        data.articles.map(({ favorited }: ArticleForResponse) => favorited),
      ).toEqual([true, false]);
    });

    it('should list all articles with correct author following field', async () => {
      const followingUser = await userFactory.create(
        {},
        { transient: { followedBy: [currentUser] } },
      );
      const notFollowingUser = await userFactory.create();
      await articleFactory.create({ authorId: followingUser.id });
      await articleFactory.create({ authorId: notFollowingUser.id });

      const { data } = await get('/articles', { schema: articlesSchema });

      expect(
        data.articles.map(({ author }: ArticleForResponse) => author.following),
      ).toEqual([false, true]);
    });

    it('supports filtering by tag', async () => {
      const first = await articleFactory.create({
        tagList: ['apple', 'orange'],
      });
      await articleFactory.create({ tagList: ['coconut'] });

      const { data } = await getPublic('/articles?tag=orange', {
        schema: articlesSchema,
      });

      expect(data.articlesCount).toEqual(1);
      expect(data.articles[0].tagList).toEqual(first.tagList);
    });

    it('supports filtering by author username', async () => {
      const author = await userFactory.create({ username: 'jake' });
      const otherAuthor = await userFactory.create({ username: 'james' });

      await articleFactory.create({ authorId: author.id });
      await articleFactory.create({ authorId: otherAuthor.id });

      const { data } = await getPublic(`/articles?author=${author.username}`, {
        schema: articlesSchema,
      });

      expect(data.articlesCount).toEqual(1);
      expect(data.articles[0].author.username).toEqual(author.username);
    });

    it('supports filtering by favorited username', async () => {
      const favoritedUser = await userFactory.create();

      const first = await articleFactory.create(
        {},
        { transient: { favorited: [favoritedUser] } },
      );
      await articleFactory.create();

      const { data } = await getPublic(
        `/articles?favorited=${favoritedUser.username}`,
        {
          schema: articlesSchema,
        },
      );

      expect(data.articlesCount).toEqual(1);
      expect(data.articles[0].title).toEqual(first.title);
    });

    it('supports limit and offset parameters', async () => {
      const articles = await Promise.all(
        new Array(15).fill(null).map(() => articleFactory.create()),
      );

      const { data } = await getPublic('/articles?limit=10&offset=5', {
        schema: articlesSchema,
      });

      expect(data.articlesCount).toEqual(15);
      expect(data.articles.length).toEqual(10);
      expect(
        data.articles.map((article: ArticleForResponse) => article.title),
      ).toEqual(
        articles
          .reverse()
          .slice(5)
          .map((article) => article.title),
      );
    });
  });

  describe('GET /articles/feed', () => {
    it('requires authentication', async () => {
      await testUnauthorized(getPublic('/articles/feed'));
    });

    it('will return multiple articles created by followed users, ordered by most recent first.', async () => {
      const firstUser = await userFactory.create(
        {},
        { transient: { followedBy: [currentUser] } },
      );
      const secondUser = await userFactory.create(
        {},
        { transient: { followedBy: [currentUser] } },
      );

      const offset = 1;
      const limit = 3;

      const articles = [
        await articleFactory.create({ authorId: firstUser.id }),
        await articleFactory.create({ authorId: firstUser.id }),
        await articleFactory.create({ authorId: secondUser.id }),
        await articleFactory.create({ authorId: secondUser.id }),
        await articleFactory.create({ authorId: secondUser.id }),
      ].reverse();

      await articleFactory.create();

      const { data } = await get(
        `/articles/feed?limit=${limit}&offset=${offset}`,
        {
          schema: articlesSchema,
        },
      );

      expect(data.articlesCount).toBe(5);
      expect(
        data.articles.map(({ title }: ArticleForResponse) => title),
      ).toEqual(
        articles.slice(offset, offset + limit).map(({ title }) => title),
      );
    });
  });

  describe('GET /articles/:slug', () => {
    it('returns article with correct author, favorited and tags', async () => {
      const author = await userFactory.create(
        {},
        { transient: { followedBy: [currentUser] } },
      );
      const tagList = ['one', 'two'];
      const article = await articleFactory.create(
        { authorId: author.id, tagList },
        { transient: { favorited: [currentUser] } },
      );

      let { data } = await getPublic(`/articles/${article.slug}`, {
        schema: articleSchema,
      });

      expect(data.article.author.following).toBe(false);
      expect(data.article.favorited).toBe(false);
      expect(data.article.tagList).toEqual(tagList);

      ({ data } = await get(`/articles/${article.slug}`, {
        schema: articleSchema,
      }));

      expect(data.article.author.following).toBe(true);
      expect(data.article.favorited).toBe(true);
      expect(data.article.tagList).toEqual(tagList);
    });
  });

  describe('POST /articles', () => {
    it('requires authentication', async () => {
      await testUnauthorized(postPublic('/articles'));
    });

    it('validates parameters', async () => {
      let { data } = await post('/articles', { body: { article: {} } });

      ['title', 'description', 'body', 'tagList'].forEach((key) =>
        expect(data.errors[key]).toBe(`${key} is a required field`),
      );

      ({ data } = await post('/articles', {
        body: {
          article: {
            title: 'a',
            description: 'a',
            body: 'a',
            tagList: ['a'],
          },
        },
      }));

      ['title', 'description', 'body'].forEach((key) =>
        expect(data.errors[key]).toBe(`${key} must be at least 5 characters`),
      );
      expect(data.errors['tagList[0]']).toBe(
        `tagList[0] must be at least 2 characters`,
      );

      ({ data } = await post('/articles', {
        body: {
          article: {
            title: randomString(151),
            description: randomString(501),
            body: randomString(100001),
            tagList: [randomString(21)],
          },
        },
      }));

      expect(data.errors.title).toBe('title must be at most 150 characters');
      expect(data.errors.description).toBe(
        'description must be at most 500 characters',
      );
      expect(data.errors.body).toBe('body must be at most 100000 characters');
      expect(data.errors['tagList[0]']).toBe(
        'tagList[0] must be at most 20 characters',
      );
    });

    it('creates article', async () => {
      const params = {
        title: 'title',
        description: 'description',
        body: 'long body',
        tagList: ['one', 'two'],
      };

      const { data } = await post('/articles', {
        body: { article: params },
        schema: articleSchema,
      });

      expect(data.article).toMatchObject(params);
    });
  });

  describe('PUT /articles/:slug', () => {
    it('requires authentication', async () => {
      const article = await articleFactory.create();
      await testUnauthorized(putPublic(`/articles/${article.slug}`));
    });

    it('validates parameters', async () => {
      const article = await articleFactory.create();

      let { data } = await put(`/articles/${article.slug}`, {
        body: {
          article: {
            title: 'a',
            description: 'a',
            body: 'a',
            tagList: ['a'],
          },
        },
      });

      ['title', 'description', 'body'].forEach((key) =>
        expect(data.errors[key]).toBe(`${key} must be at least 5 characters`),
      );
      expect(data.errors['tagList[0]']).toBe(
        `tagList[0] must be at least 2 characters`,
      );

      ({ data } = await put(`/articles/${article.slug}`, {
        body: {
          article: {
            title: randomString(151),
            description: randomString(501),
            body: randomString(100001),
            tagList: [randomString(21)],
          },
        },
      }));

      expect(data.errors.title).toBe('title must be at most 150 characters');
      expect(data.errors.description).toBe(
        'description must be at most 500 characters',
      );
      expect(data.errors.body).toBe('body must be at most 100000 characters');
      expect(data.errors['tagList[0]']).toBe(
        'tagList[0] must be at most 20 characters',
      );
    });

    it('restricts updating article of someone else', async () => {
      const author = await userFactory.create();
      const article = await articleFactory.create({ authorId: author.id });

      const { status, data } = await put(`/articles/${article.slug}`, {
        body: {
          article: {
            title: 'title',
            description: 'description',
            body: 'long body',
            tagList: ['one', 'three'],
          },
        },
      });

      expect(status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('updates article', async () => {
      const article = await articleFactory.create({ tagList: ['one', 'two'] });

      const params = {
        title: 'title',
        description: 'description',
        body: 'long body',
        tagList: ['one', 'three'],
      };

      const { data } = await put(`/articles/${article.slug}`, {
        body: { article: params },
        schema: articleSchema,
      });

      expect(data.article).toMatchObject(params);
    });
  });

  describe('DELETE /article/:slug', () => {
    it('requires authentication', async () => {
      await testUnauthorized(delPublic('/articles/slug'));
    });

    it('restricts deleting article of someone else', async () => {
      const author = await userFactory.create();
      const article = await articleFactory.create({ authorId: author.id });
      const { data } = await del(`/articles/${article.slug}`);

      expect(data.error).toBe('Forbidden');
    });

    it('deletes article', async () => {
      const article = await articleFactory.create({ tagList: ['tag'] });
      await del(`/articles/${article.slug}`);

      await testNotFound(get(`/articles/${article.slug}`));
    });
  });

  describe('POST /articles/:slug/favorite', () => {
    it('requires authentication', async () => {
      await testUnauthorized(postPublic('/articles/slug/favorite'));
    });

    it('should mark article as favorite', async () => {
      const article = await articleFactory.create();

      const { data } = await post(`/articles/${article.slug}/favorite`, {
        schema: articleSchema,
      });

      expect(data.article.favorited).toBe(true);
      expect(data.article.favoritesCount).toBe(1);
    });

    it('should not fail when article is already favorite', async () => {
      const article = await articleFactory.create(
        {},
        { transient: { favorited: [currentUser] } },
      );

      const { data } = await post(`/articles/${article.slug}/favorite`, {
        schema: articleSchema,
      });

      expect(data.article.favorited).toBe(true);
      expect(data.article.favoritesCount).toBe(1);
    });
  });

  describe('DELETE /articles/:slug/favorite', () => {
    it('requires authentication', async () => {
      await testUnauthorized(postPublic('/articles/slug/favorite'));
    });

    it('should unmark article as favorite', async () => {
      const article = await articleFactory.create(
        {},
        { transient: { favorited: [currentUser] } },
      );

      const { data } = await del(`/articles/${article.slug}/favorite`, {
        schema: articleSchema,
      });

      expect(data.article.favorited).toBe(false);
      expect(data.article.favoritesCount).toBe(0);
    });

    it('should not fail when article is not favorite', async () => {
      const article = await articleFactory.create();

      const { data } = await del(`/articles/${article.slug}/favorite`, {
        schema: articleSchema,
      });

      expect(data.article.favorited).toBe(false);
      expect(data.article.favoritesCount).toBe(0);
    });
  });
});
