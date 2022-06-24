import 'dotenv/config';
import { Client } from 'pg';
import { create } from 'tests/utils/create';
import { OrmName } from '../orms/types';
import config from '../config';
import { deepStrictEqual } from 'assert';
import {
  clearDb,
  connectAllORMs,
  disconnectAllORMs,
  formatMsAsS,
  getMs,
  ormNames,
} from './utils';

const articlesToLoad = 100;
const requestsPerORM = 300;

config.startServer = false;
import app from '../index';

// For prisma to serialize date properly
process.env.TZ = 'UTC';

const tables = ['articleTag', 'userArticleFavorite', 'article', 'tag', 'user'];

(async () => {
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await db.connect();

  try {
    await clearDb(db, tables);
    await prepareDb(db);
    try {
      await connectAllORMs();
      await verifyResponses();
      await measureORMs();
    } finally {
      await disconnectAllORMs();
    }
  } catch (err) {
    console.error(err);
  } finally {
    await clearDb(db, tables);
    await db.end();
    process.exit();
  }
})();

async function prepareDb(db: Client) {
  const tagsCount = 30;
  const usersCount = 10;
  const tagsInArticle = 5;
  const articlesCount = 100;
  const favoritesInArticle = 3;
  const now = new Date();

  await create(
    'tag',
    Array.from({ length: tagsCount }).map((_, i) => {
      const id = i + 1;
      return {
        id,
        tag: `tag-${id}`,
      };
    }),
    {
      db,
    },
  );

  await create(
    'user',
    Array.from({ length: usersCount }).map((_, i) => {
      const id = i + 1;
      return {
        id,
        username: `username-${id}`,
        email: `email-${id}@mail.com`,
        password: 'password',
      };
    }),
    {
      db,
    },
  );

  await create(
    'article',
    Array.from({ length: articlesCount }).map((_, i) => {
      const id = i + 1;
      return {
        id,
        authorId: (i % usersCount) + 1,
        slug: `slug-${id}`,
        title: `title ${id}`,
        description: `description ${id}`,
        body: `body ${id}`,
        favoritesCount: 5, // wrong count specially to make sure none of the orms will calculate this field on the fly
        createdAt: now,
        updatedAt: now,
      };
    }),
    {
      db,
    },
  );

  await create(
    'articleTag',
    Array.from({ length: articlesCount }).flatMap((_, i) => {
      return Array.from({ length: tagsInArticle }).map((_, n) => {
        const articleId = (i % articlesCount) + 1;
        return {
          id: i * tagsInArticle + n + 1,
          articleId,
          tagId: ((articleId + n) % tagsCount) + 1,
        };
      });
    }),
    {
      db,
    },
  );

  await create(
    'userArticleFavorite',
    Array.from({ length: articlesCount }).flatMap((_, i) => {
      return Array.from({ length: favoritesInArticle }).map((_, n) => {
        const articleId = (i % articlesCount) + 1;
        return {
          id: i * favoritesInArticle + n + 1,
          articleId,
          userId: ((articleId + n) % usersCount) + 1,
        };
      });
    }),
    {
      db,
    },
  );
}

async function verifyResponses() {
  const firstResponse = await getResponse(ormNames[0]);
  for (const ormName of ormNames.slice(1)) {
    const response = await getResponse(ormName);
    try {
      deepStrictEqual(firstResponse, response);
    } catch (err) {
      console.error(
        `> Response of ${ormName} is different from ${ormNames[0]}`,
      );
      throw err;
    }
  }
}

async function measureORMs() {
  for (const ormName of ormNames) {
    const start = getMs();

    for (let i = 0; i < requestsPerORM; i++) {
      await performRequest(ormName);
    }

    const end = getMs();

    console.log(`${ormName}: ${formatMsAsS(end - start)}`);
  }
}

async function getResponse(ormName: OrmName) {
  const { body } = await performRequest(ormName);
  return JSON.parse(body);
}

function performRequest(ormName: OrmName) {
  return app.inject({
    method: 'GET',
    url: `/articles?limit=${articlesToLoad}`,
    headers: {
      'x-orm': ormName,
    },
    payload: {},
  });
}
