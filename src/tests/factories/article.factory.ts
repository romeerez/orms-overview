import { Factory } from 'fishery';
import { db } from 'tests/utils/db';
import { create } from 'tests/utils/create';
import { Article } from 'app/article/article.types';
import { User } from 'app/user/user.types';
import { Tag } from 'app/tag/tag.types';

export const articleFactory = Factory.define<
  Article & { tagList: string[] },
  { favorited?: [User] }
>(({ sequence, onCreate, transientParams }) => {
  onCreate(async ({ tagList, ...params }) => {
    const article = await create<Article>('article', params);

    if (tagList.length) {
      await create<Tag[]>(
        'tag',
        tagList.map((tag) => ({ tag })),
        {
          onConflict: '(tag) DO NOTHING',
        },
      );
      const { rows: tags } = await db.query(
        `SELECT * FROM "tag" WHERE "tag"."tag" IN (${tagList
          .map((tag) => `'${tag}'`)
          .join(', ')})`,
      );

      await create(
        'articleTag',
        tags.map(({ id }: { id: number }) => ({
          articleId: article.id,
          tagId: id,
        })),
      );
    }

    const { favorited } = transientParams;
    if (favorited?.length) {
      await create(
        'userArticleFavorite',
        favorited.map(({ id }) => ({
          userId: id,
          articleId: article.id,
        })),
      );
    }

    return { tagList, ...article };
  });

  let createdAt = new Date();
  createdAt = new Date(
    createdAt.setFullYear(createdAt.getFullYear() - 1) + sequence * 1000,
  );

  return {
    id: sequence,
    authorId: 1,
    slug: `slug-${sequence}`,
    title: `title-${sequence}`,
    description: `description-${sequence}`,
    body: `body-${sequence}`,
    favoritesCount: transientParams.favorited?.length || 0,
    tagList: [],
    updatedAt: createdAt,
    createdAt: createdAt,
  };
});
