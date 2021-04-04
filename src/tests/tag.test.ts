import { articleFactory } from 'tests/factories/article.factory';
import { del, getPublic, put } from 'tests/utils/request';
import { tagsSchema } from 'tests/utils/schemas';
import { db } from 'tests/utils/db';
import { clearDatabase } from 'tests/utils/for-prisma';

describe('tag endpoints', () => {
  clearDatabase();

  beforeEach(async () => {
    if (process.env.ORM !== 'prisma') return;

    await db.query('DELETE FROM "articleTag"');
    await db.query('DELETE FROM "tag"');
    await db.query('DELETE FROM "article"');
  });

  it('lists all tags', async () => {
    const article = await articleFactory.create({ tagList: ['one', 'two'] });

    const { data } = await getPublic('/tags', { schema: tagsSchema });
    expect(data.tags.sort()).toEqual(article.tagList.sort());
  });

  it('should delete unused tags when updating article', async () => {
    const firstArticle = await articleFactory.create({
      tagList: ['one', 'two', 'three'],
    });
    await articleFactory.create({
      tagList: ['two', 'three'],
    });

    let { data } = await getPublic('/tags', { schema: tagsSchema });
    expect(data.tags.sort()).toEqual(['one', 'two', 'three'].sort());

    await put(`/articles/${firstArticle.slug}`, {
      body: {
        article: {
          tagList: ['three', 'four'],
        },
      },
    });

    ({ data } = await getPublic('/tags', { schema: tagsSchema }));
    expect(data.tags.sort()).toEqual(['two', 'three', 'four'].sort());
  });

  it('should delete unused tags when deleting article', async () => {
    const firstArticle = await articleFactory.create({
      tagList: ['one', 'two', 'three'],
    });
    await articleFactory.create({
      tagList: ['two', 'three'],
    });

    let { data } = await getPublic('/tags', { schema: tagsSchema });
    expect(data.tags.sort()).toEqual(['one', 'two', 'three'].sort());

    await del(`/articles/${firstArticle.slug}`);

    ({ data } = await getPublic('/tags', { schema: tagsSchema }));
    expect(data.tags.sort()).toEqual(['two', 'three'].sort());
  });
});
