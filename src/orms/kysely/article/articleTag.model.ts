import { Generated } from 'kysely';

export interface ArticleTag {
  id: Generated<number>;
  articleId: number;
  tagId: number;
}
