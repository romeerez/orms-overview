import { Profile } from 'app/profile/profile.types';

export type Comment = {
  id: number;
  authorId: number;
  articleId: number;
  body: string;
  updatedAt: Date;
  createdAt: Date;
};

export type CommentForResponse = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: Profile;
};
