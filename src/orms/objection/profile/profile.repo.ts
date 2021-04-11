import { db, QueryBuilder } from 'orms/objection/model';
import { Article } from 'orms/objection/article/article.model';
import { User as UserType } from 'app/user/user.types';
import { Comment } from 'orms/objection/comment/comment.model';
import { ProfileRepo } from 'orms/types';
import { User } from 'orms/objection/user/user.model';
import { NotFoundError } from 'errors';
import { Profile } from 'app/profile/profile.types';
import { UserFollow } from 'orms/objection/user/userFollow.model';

export const selectAuthor = (
  query: QueryBuilder<Article | Comment>,
  model: typeof Article | typeof Comment,
  currentUser?: UserType,
) => {
  const following = getFollowingSelection('author', currentUser);

  query.select(
    model
      .relatedQuery('author')
      .select(
        db.raw(
          `row_to_json("author".*)::jsonb || ('{"following":' || ${following} || '}')::jsonb`,
        ),
      )
      .as('author'),
  );
};

const getFollowingSelection = (tableName: string, currentUser?: UserType) => {
  if (currentUser) {
    return `(${db
      .select(
        db.raw(
          `coalesce((${db('userFollow')
            .select(db.raw('true'))
            .where('userFollow.followingId', db.raw(`"${tableName}"."id"`))
            .where('userFollow.followerId', currentUser.id)}), false)`,
        ),
      )
      .as('following')
      .toQuery()})`;
  } else {
    return 'false';
  }
};

const buildQuery = (params: { username?: string }, currentUser?: UserType) => {
  const query = User.query().select([
    'user.*',
    db.raw(`${getFollowingSelection('user', currentUser)} AS "following"`),
  ]);

  if (params.username) query.where('username', params.username);

  return (query as unknown) as QueryBuilder<User & Profile>;
};

const getProfileByUsername = async (
  username: string,
  currentUser?: UserType,
) => {
  const profile = await buildQuery({ username }, currentUser).first();
  if (!profile) throw new NotFoundError();
  return profile;
};

export const profileRepo: ProfileRepo = {
  getProfileByUsername,

  async followByUsername(username, currentUser) {
    const profile = await getProfileByUsername(username, currentUser);
    if (!profile.following) {
      await UserFollow.query().insert({
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
      await UserFollow.query()
        .where({ followingId: profile.id, followerId: currentUser.id })
        .delete();
      profile.following = false;
    }

    return profile;
  },
};
