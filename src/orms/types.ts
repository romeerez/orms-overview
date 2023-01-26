import { User, UserWithPassword } from 'app/user/user.types';
import { Article, ArticleForResponse } from 'app/article/article.types';
import { CommentForResponse } from 'app/comment/comment.types';
import { Tag } from 'app/tag/tag.types';
import { Profile } from 'app/profile/profile.types';
import { EntityManager } from '@mikro-orm/postgresql';
export type OrmName =
  | 'sequelize'
  | 'typeorm'
  | 'knex'
  | 'prisma'
  | 'objection'
  | 'mikroorm'
  | 'orchid-orm';

export type OrmInterface = {
  initialize?(): Promise<unknown> | unknown;
  close?(): Promise<unknown> | unknown;

  articleRepo: ArticleRepo;
  commentRepo: CommentRepo;
  tagRepo: TagRepo;
  profileRepo: ProfileRepo;
  userRepo: UserRepo;
};

type RequestMeta = { em: EntityManager };

export type ArticleRepo = {
  listArticles(
    params: {
      author?: string;
      favorited?: string;
      tag?: string;
      fromFollowedAuthors?: boolean;
      limit?: number;
      offset?: number;
    },
    currentUser: User | undefined,
    meta: RequestMeta,
  ): Promise<{ articles: ArticleForResponse[]; count: number }>;

  getArticleBySlug(
    slug: string,
    currentUser: User | undefined,
    meta: RequestMeta,
  ): Promise<ArticleForResponse>;

  createArticle(
    params: Pick<Article, 'title' | 'slug' | 'description' | 'body'> & {
      tagList: string[];
    },
    currentUser: User,
    meta: RequestMeta,
  ): Promise<ArticleForResponse>;

  updateArticleBySlug(
    slug: string,
    params: Partial<Pick<Article, 'title' | 'description' | 'body'>> & {
      tagList?: string[];
    },
    currentUser: User,
    meta: RequestMeta,
  ): Promise<ArticleForResponse>;

  deleteArticleBySlug(
    slug: string,
    currentUser: User,
    meta: RequestMeta,
  ): Promise<void>;

  markAsFavoriteBySlug(
    slug: string,
    currentUser: User,
    meta: RequestMeta,
  ): Promise<ArticleForResponse>;

  unmarkAsFavoriteBySlug(
    slug: string,
    currentUser: User,
    meta: RequestMeta,
  ): Promise<ArticleForResponse>;
};

export type CommentRepo = {
  articleComments(
    slug: string,
    currentUser: User | undefined,
    meta: RequestMeta,
  ): Promise<CommentForResponse[]>;

  createArticleComment(
    slug: string,
    params: { body: string },
    currentUser: User,
    meta: RequestMeta,
  ): Promise<CommentForResponse>;

  deleteArticleComment(
    id: number,
    currentUser: User,
    meta: RequestMeta,
  ): Promise<void>;
};

export type TagRepo = {
  listTags(meta: RequestMeta): Promise<Tag[]>;
};

export type ProfileRepo = {
  getProfileByUsername(
    username: string,
    currentUser: User | undefined,
    meta: RequestMeta,
  ): Promise<Profile>;

  followByUsername(
    username: string,
    currentUser: User,
    meta: RequestMeta,
  ): Promise<Profile>;

  unfollowByUsername(
    username: string,
    currentUser: User,
    meta: RequestMeta,
  ): Promise<Profile>;
};

export type UserRepo = {
  create(
    params: Omit<UserWithPassword, 'id'>,
    meta: RequestMeta,
  ): Promise<User>;

  findByEmail(
    email: string,
    meta: RequestMeta,
  ): Promise<UserWithPassword | undefined>;

  findById(
    id: number,
    meta: RequestMeta,
  ): Promise<UserWithPassword | undefined>;

  updateUser(
    user: User,
    params: Partial<Omit<UserWithPassword, 'id'>>,
    meta: RequestMeta,
  ): Promise<User>;
};
