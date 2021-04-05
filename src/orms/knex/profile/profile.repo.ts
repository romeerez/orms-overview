import { ProfileRepo } from 'orms/types';
import { Knex } from 'knex';
import { User } from 'app/user/user.types';
import { db } from 'orms/knex/db';
import { NotFoundError } from 'errors';

export const buildProfileQuery = (
  params: {
    query?: Knex.QueryBuilder;
    username?: string;
    joinForeignKey?: string;
  },
  currentUser?: User,
) => {
  let following;
  if (currentUser) {
    following = db
      .select(
        db.raw(
          `coalesce((${db('userFollow')
            .select(db.raw('true'))
            .where('userFollow.followingId', db.raw('"user"."id"'))
            .where('userFollow.followerId', currentUser.id)}), false)`,
        ),
      )
      .as('following');
  } else {
    following = db.raw('false AS "following"');
  }

  const query = params.query || db('user');
  query.select(db.raw('row_to_json("user".*) AS "author"'));

  if (params.username) {
    query.where('username', params.username);
  }

  if (params.joinForeignKey) {
    query.join(
      db('user').select('*', following).as('user'),
      'user.id',
      params.joinForeignKey,
    );
  } else {
    query.select('*', following);
  }

  return query;
};

const getProfileByUsername = async (username: string, currentUser?: User) => {
  const profile = await buildProfileQuery({ username }, currentUser).first();
  if (!profile) throw new NotFoundError();
  return profile;
};

export const profileRepo: ProfileRepo = {
  getProfileByUsername,

  async followByUsername(username, currentUser) {
    const profile = await getProfileByUsername(username, currentUser);

    if (!profile.following) {
      await db('userFollow').insert({
        followingId: profile.id,
        followerId: currentUser.id,
      });
      profile.following = true;
    }

    return profile;
  },

  async unfollowByUsername(username, currentUser) {
    const profile = await getProfileByUsername(username, currentUser);

    if (profile.following) {
      await db('userFollow')
        .where({ followingId: profile.id, followerId: currentUser.id })
        .delete();
      profile.following = false;
    }

    return profile;
  },
};
