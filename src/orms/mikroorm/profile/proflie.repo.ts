import { UserFollow } from '../user/userFollow.model';
import { EntityManager, SelectQueryBuilder } from '@mikro-orm/postgresql';
import { User } from '../user/user.model';
import { User as UserType } from '../../../app/user/user.types';
import { Profile as ProfileType } from '../../../app/profile/profile.types';
import { ProfileRepo } from '../../types';
import { NotFoundError } from '../../../errors';

export const buildProfileQuery = ({
  em,
  currentUser,
  username,
}: {
  em: EntityManager;
  currentUser?: UserType;
  username?: string;
}) => {
  const knex = em.getKnex();

  const query = em.qb(User, 'user').select([
    'username',
    'bio',
    'image',
    `${
      currentUser
        ? `coalesce((${em
            .qb(UserFollow, 'follow')
            .select('true::boolean')
            .where({
              followerId: knex.raw(currentUser.id),
              followingId: knex.ref('user.id'),
            })
            .getQuery()}), false)`
        : 'false::boolean'
    } AS following`,
  ]);

  if (username) {
    query.where({ username });
  }

  return (query as unknown) as SelectQueryBuilder<ProfileType>;
};

export const profileRepo: ProfileRepo = {
  async getProfileByUsername(username, currentUser, { em }) {
    const query = buildProfileQuery({ username, currentUser, em });
    const profile = await query.execute('get');
    if (!profile) throw new NotFoundError();
    return profile;
  },

  async followByUsername(username, currentUser, { em }) {
    return await em.transactional(async (em) => {
      const user = await em.findOne(User, { username });
      if (!user) throw new NotFoundError();

      await em.nativeInsert(
        new UserFollow({
          followerId: currentUser.id,
          followingId: user.id,
        }),
      );

      return {
        ...user,
        following: true,
      };
    });
  },

  async unfollowByUsername(username, currentUser, { em }) {
    return await em.transactional(async (em) => {
      const user = await em.findOne(User, { username });
      if (!user) throw new NotFoundError();

      await em.nativeDelete(UserFollow, {
        followerId: currentUser.id,
        followingId: user.id,
      });

      return {
        ...user,
        following: false,
      };
    });
  },
};
