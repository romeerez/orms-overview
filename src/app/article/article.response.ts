import { ArticleForResponse } from 'app/article/article.types';

const convertArticle = (article: ArticleForResponse) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  body: article.body,
  tagList: article.tagList,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  favorited: article.favorited,
  favoritesCount: article.favoritesCount,
  author: article.author,
});

export const article = (article: ArticleForResponse) => ({
  article: convertArticle(article),
});

export const articles = (articles: ArticleForResponse[], count: number) => ({
  articles: articles.map(convertArticle),
  articlesCount: count,
});
