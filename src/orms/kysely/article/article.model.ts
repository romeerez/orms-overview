import { Generated } from 'kysely';

export interface Article {
  id: Generated<number>;
  authorId: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  favoritesCount: number;
  updatedAt: Date;
  createdAt: Date;
}
