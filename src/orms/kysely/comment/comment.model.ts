import { Generated } from 'kysely';

export interface Comment {
  id: Generated<number>;
  authorId: number;
  articleId: number;
  body: string;
  updatedAt: Date;
  createdAt: Date;
}
