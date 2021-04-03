import { OrmInterface } from 'orms/types';
import { Sequelize } from 'sequelize';
import config from 'config';

export const db = new Sequelize(config.dbUrl, {
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

import { articleRepo } from 'orms/sequelize/article/article.repo';
import { commentRepo } from 'orms/sequelize/comment/comment.repo';
import { tagRepo } from 'orms/sequelize/tag/tag.repo';
import { profileRepo } from 'orms/sequelize/profile/profile.repo';
import { userRepo } from 'orms/sequelize/user/user.repo';

export const sequelize: OrmInterface = {
  initialize() {},
  close() {
    db.close();
  },

  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
