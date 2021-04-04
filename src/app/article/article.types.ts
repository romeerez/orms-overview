import { Profile } from 'app/profile/profile.types';

export type Article = {
  id: number;
  authorId: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  favoritesCount: number;
  updatedAt: Date;
  createdAt: Date;
};

export type ArticleTag = {
  articleId: number;
  tagId: number;
};

export type Tag = {
  id: number;
  tag: string;
};

export type UserArticleFavorite = {
  userId: number;
  articleId: number;
};

export type ArticleForResponse = Omit<Article, 'authorId'> & {
  author: Profile;
  tagList: string[];
  favorited: boolean;
};
