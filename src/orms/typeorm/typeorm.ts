import { OrmInterface } from 'orms/types';
import { createConnection, Connection } from 'typeorm';
import config from 'config';
import { articleRepo } from 'orms/typeorm/article/article.repo';
import { commentRepo } from 'orms/typeorm/comment/comment.repo';
import { tagRepo } from 'orms/typeorm/tag/tag.repo';
import { profileRepo } from 'orms/typeorm/profile/profile.repo';
import { userRepo } from 'orms/typeorm/user/user.repo';

let connection: Connection | undefined;
const initialize = async () => {
  if (!connection)
    connection = await createConnection({
      type: 'postgres',
      url: config.dbUrl,
      ssl: false,
      synchronize: false,
      // logging: ['query'],
      entities: ['src/orms/typeorm/**/*.model.ts'],
    });

  return connection;
};

export const typeorm: OrmInterface = {
  initialize,
  async close() {
    const connection = await initialize();
    await connection.close();
  },

  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
