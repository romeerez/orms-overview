import { object, string, boolean, array, number, reach } from 'lib/yup';

export const userSchema = object({
  user: object({
    email: string().required(),
    token: string().required(),
    username: string().required(),
    bio: string().nullable(),
    image: string().nullable(),
  }),
});

export const profileSchema = object({
  profile: object({
    username: string().required(),
    bio: string().nullable(),
    image: string().nullable(),
    following: boolean(),
  }),
});

export const articleSchema = object({
  article: object({
    slug: string().required(),
    title: string().required(),
    description: string().required(),
    body: string().required(),
    tagList: array().of(string().required()).required(),
    createdAt: string().required(),
    updatedAt: string().required(),
    favorited: boolean().required(),
    favoritesCount: number().required(),
    author: reach(profileSchema, 'profile').required(),
  }),
});

export const articlesSchema = object({
  articles: array().of(reach(articleSchema, 'article').required()).required(),
  articlesCount: number().required(),
});

export const commentSchema = object({
  comment: object({
    id: number().required(),
    createdAt: string().required(),
    updatedAt: string().required(),
    body: string().required(),
    author: reach(profileSchema, 'profile').required(),
  }),
});

export const commentsSchema = object({
  comments: array().of(reach(commentSchema, 'comment').required()).required(),
});

export const tagsSchema = object({
  tags: array().of(string().required()).required(),
});
