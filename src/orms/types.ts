import { User, UserWithPassword } from 'app/user/user.types';
import { Article, ArticleForResponse } from 'app/article/article.types';
import { CommentForResponse } from 'app/comment/comment.types';
import { Tag } from 'app/tag/tag.types';
import { Profile } from 'app/profile/profile.types';

export type OrmName = 'sequelize' | 'typeorm' | 'prisma';

export type OrmInterface = {
  initialize?(): Promise<unknown> | unknown;
  close?(): Promise<unknown> | unknown;

  articleRepo: ArticleRepo;
  commentRepo: CommentRepo;
  tagRepo: TagRepo;
  profileRepo: ProfileRepo;
  userRepo: UserRepo;
};

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
    currentUser?: User,
  ): Promise<{ articles: ArticleForResponse[]; count: number }>;

  getArticleBySlug(
    slug: string,
    currentUser?: User,
  ): Promise<ArticleForResponse>;

  createArticle(
    params: Pick<Article, 'title' | 'slug' | 'description' | 'body'> & {
      tagList: string[];
    },
    currentUser: User,
  ): Promise<ArticleForResponse>;

  updateArticleBySlug(
    slug: string,
    params: Partial<Pick<Article, 'title' | 'description' | 'body'>> & {
      tagList?: string[];
    },
    currentUser: User,
  ): Promise<ArticleForResponse>;

  deleteArticleBySlug(slug: string, currentUser: User): Promise<void>;

  markAsFavoriteBySlug(
    slug: string,
    currentUser: User,
  ): Promise<ArticleForResponse>;

  unmarkAsFavoriteBySlug(
    slug: string,
    currentUser: User,
  ): Promise<ArticleForResponse>;
};

export type CommentRepo = {
  articleComments(
    slug: string,
    currentUser?: User,
  ): Promise<CommentForResponse[]>;

  createArticleComment(
    slug: string,
    params: { body: string },
    currentUser: User,
  ): Promise<CommentForResponse>;

  deleteArticleComment(id: number, currentUser: User): Promise<void>;
};

export type TagRepo = {
  listTags(): Promise<Tag[]>;
};

export type ProfileRepo = {
  getProfileByUsername(username: string, currentUser?: User): Promise<Profile>;

  followByUsername(username: string, currentUser: User): Promise<Profile>;

  unfollowByUsername(username: string, currentUser: User): Promise<Profile>;
};

export type UserRepo = {
  create(params: Omit<UserWithPassword, 'id'>): Promise<User>;

  findByEmail(email: string): Promise<UserWithPassword | undefined>;

  findById(id: number): Promise<UserWithPassword | undefined>;

  updateUser(
    user: User,
    params: Partial<Omit<UserWithPassword, 'id'>>,
  ): Promise<User>;
};
