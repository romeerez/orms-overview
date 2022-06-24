import { ProfileRepo } from 'orms/types';
import { Knex } from 'knex';
import { User } from 'app/user/user.types';
import { db } from 'orms/knex/db';
import { NotFoundError } from 'errors';
import { currentUser } from '../../../tests/factories/user.factory';

const buildFollowingSelect = (currentUser?: User) => {
  if (currentUser) {
    return db
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
    return db.raw('false AS "following"');
  }
};

export const buildProfileQuery = (
  params: {
    query?: Knex.QueryBuilder;
    username?: string;
    joinForeignKey?: string;
    id?: number;
  },
  currentUser?: User,
) => {
  const query = params.query || db('user');

  if (params.username) {
    query.where('username', params.username);
  }

  if (params.id) {
    query.where('id', params.id);
  }

  const following = buildFollowingSelect(currentUser);

  if (params.joinForeignKey) {
    query.select(db.raw('row_to_json("user".*) AS "author"'));
    query
      .select(
        db.raw(
          `json_build_object(` +
            `'username', "user".username, 'bio', "user".bio, 'image', "user".image, 'following', "user".following` +
            `) AS "author"`,
        ),
      )
      .join(
        db('user').select('*', following).as('user'),
        'user.id',
        params.joinForeignKey,
      );
  } else {
    query.select('username', 'bio', 'image', following);
  }

  return query;
};

export const profileRepo: ProfileRepo = {
  async getProfileByUsername(username, currentUser) {
    const profile = await buildProfileQuery({ username }, currentUser).first();
    if (!profile) throw new NotFoundError();
    return profile;
  },

  async followByUsername(username, currentUser) {
    const profile = await db('user')
      .select('id', buildFollowingSelect(currentUser))
      .where({ username })
      .first();

    if (!profile) throw new NotFoundError();

    if (!profile.following) {
      await db('userFollow').insert({
        followingId: profile.id,
        followerId: currentUser.id,
      });
    }

    return buildProfileQuery({ id: profile.id }, currentUser).first();
  },

  async unfollowByUsername(username, currentUser) {
    const profile = await db('user')
      .select('id', buildFollowingSelect(currentUser))
      .where({ username })
      .first();

    if (!profile) throw new NotFoundError();

    if (profile.following) {
      await db('userFollow')
        .where({ followingId: profile.id, followerId: currentUser.id })
        .delete();
      profile.following = false;
    }

    return buildProfileQuery({ id: profile.id }, currentUser).first();
  },
};
