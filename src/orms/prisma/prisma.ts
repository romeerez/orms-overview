import { OrmInterface } from 'orms/types';
import { articleRepo } from 'orms/prisma/article/article.repo';
import { commentRepo } from 'orms/prisma/comment/comment.repo';
import { tagRepo } from 'orms/prisma/tag/tag.repo';
import { profileRepo } from 'orms/prisma/profile/profile.repo';
import { userRepo } from 'orms/prisma/user/user.repo';
import { client } from 'orms/prisma/client';

export const prisma: OrmInterface = {
  close() {
    return client.$disconnect();
  },

  articleRepo,
  commentRepo,
  tagRepo,
  profileRepo,
  userRepo,
};
