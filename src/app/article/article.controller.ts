import { object, string, number } from 'yup';
import { RequestHandler } from 'types';
import validate from 'lib/validate';
import { getCurrentUser } from 'lib/currentUser';
import * as response from 'app/article/article.response';
import { articleParams } from 'app/article/article.params';
import { authUser } from 'lib/decorators';
import slugify from 'slugify';

const slugParam = object({
  slug: articleParams.slug.required(),
});

const listArticlesParams = object({
  author: string(),
  favorited: string(),
  tag: string(),
  limit: number(),
  offset: number(),
});

export const listArticles: RequestHandler = async (request) => {
  const params = validate(listArticlesParams, request.query);
  const currentUser = await getCurrentUser(request);
  const { articles, count } = await request.orm.articleRepo.listArticles(
    params,
    currentUser,
  );
  return response.articles(articles, count);
};

const articlesFeedParams = object({
  limit: number(),
  offset: number(),
});

export const articlesFeed = authUser(async (request) => {
  const params = validate(articlesFeedParams, request.query);
  const { articles, count } = await request.orm.articleRepo.listArticles(
    {
      ...params,
      fromFollowedAuthors: true,
    },
    request.user,
  );
  return response.articles(articles, count);
});

export const getArticleBySlug: RequestHandler = async (request) => {
  const { slug } = validate(slugParam, request.params);
  const currentUser = await getCurrentUser(request);
  const article = await request.orm.articleRepo.getArticleBySlug(
    slug,
    currentUser,
  );
  return response.article(article);
};

const createArticleParams = object({
  article: object({
    title: articleParams.title.required(),
    description: articleParams.description.required(),
    body: articleParams.body.required(),
    tagList: articleParams.tagList.required(),
  }),
});

export const createArticle = authUser(async (request) => {
  const { article: params } = validate(createArticleParams, request.body);
  const article = await request.orm.articleRepo.createArticle(
    {
      ...params,
      slug: slugify(params.title, { lower: true }),
    },
    request.user,
  );
  return response.article(article);
});

const updateArticleParams = object({
  article: object({
    title: articleParams.title,
    description: articleParams.description,
    body: articleParams.body,
    tagList: articleParams.tagList,
  }),
});

export const updateArticle = authUser(async (request) => {
  const { slug } = validate(slugParam, request.params);
  const { article: params } = validate(updateArticleParams, request.body);

  const article = await request.orm.articleRepo.updateArticleBySlug(
    slug,
    params,
    request.user,
  );
  return response.article(article);
});

export const deleteArticle = authUser(async (request) => {
  const { slug } = validate(slugParam, request.params);
  await request.orm.articleRepo.deleteArticleBySlug(slug, request.user);
  return null;
});

export const markAsFavorite = authUser(async (request) => {
  const { slug } = validate(slugParam, request.params);
  const article = await request.orm.articleRepo.markAsFavoriteBySlug(
    slug,
    request.user,
  );
  return response.article(article);
});

export const unmarkAsFavorite = authUser(async (request) => {
  const { slug } = validate(slugParam, request.params);
  const article = await request.orm.articleRepo.unmarkAsFavoriteBySlug(
    slug,
    request.user,
  );
  return response.article(article);
});
