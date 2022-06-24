import 'dotenv/config';
import { Client } from 'pg';
import {
  clearDb,
  connectAllORMs,
  disconnectAllORMs,
  formatMsAsS,
  getMs,
  ormNames,
} from './utils';
import { create } from '../tests/utils/create';
import { OrmName } from '../orms/types';
import { createToken } from '../lib/jwt';
import config from '../config';

config.startServer = false;
import app from '../index';

const createArticlesCount = 1000;
const tagsInArticle = 5;

const tags = Array.from({ length: 30 }).map((_, i) => `tag-${i + 1}`);

(async () => {
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await db.connect();

  try {
    await clearDb(db, ['user']);
    await prepareDb(db);
    try {
      await connectAllORMs();
      await measureORMs(db);
    } finally {
      await disconnectAllORMs();
    }
  } catch (err) {
    console.error(err);
  } finally {
    await clearDb(db, ['articleTag', 'tag', 'article', 'user']);
    await db.end();
    process.exit();
  }
})();

async function prepareDb(db: Client) {
  await create(
    'user',
    [
      {
        id: 1,
        username: `username`,
        email: `email@mail.com`,
        password: 'password',
      },
    ],
    {
      db,
    },
  );
}

async function measureORMs(db: Client) {
  const token = createToken({ id: 1, email: 'email@mail.com' });

  for (const ormName of ormNames) {
    await clearDb(db, ['articleTag', 'tag', 'article']);

    const start = getMs();

    for (let i = 0; i < createArticlesCount; i++) {
      const articleTags = Array.from({ length: tagsInArticle }).map(
        (_, n) => tags[(i + n) % tags.length],
      );
      await performRequest(ormName, token, {
        title: `title ${i}`,
        description: `description ${i}`,
        body: `body ${i}`,
        tagList: articleTags,
      });
    }

    const end = getMs();

    console.log(`${ormName}: ${formatMsAsS(end - start)}`);
  }
}

async function performRequest(
  ormName: OrmName,
  token: string,
  article: {
    title: string;
    description: string;
    body: string;
    tagList: string[];
  },
) {
  return app.inject({
    method: 'POST',
    url: '/articles',
    headers: {
      'x-orm': ormName,
      authorization: `Token ${token}`,
    },
    payload: {
      article,
    },
  });
}
