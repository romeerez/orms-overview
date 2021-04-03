import { ProfileRepo } from 'orms/types';
import { User as UserType } from 'app/user/user.types';
import { UserFollow } from 'orms/typeorm/user/userFollow.model';
import { getRepository, SelectQueryBuilder } from 'typeorm';
import { User } from 'orms/typeorm/user/user.model';
import { NotFoundError } from 'errors';

export const buildProfileQuery = (
  params: {
    query?: SelectQueryBuilder<unknown>;
    username?: string;
  },
  currentUser?: UserType,
) => {
  const userRepo = getRepository(User);

  let query;
  if (params.query) {
    query = params.query.subQuery().from(User, 'user');
  } else {
    query = userRepo.createQueryBuilder('user');
  }

  query = query.select(['"user"."username"', '"user"."image"', '"user"."bio"']);

  if (currentUser) {
    const subquery = query
      .subQuery()
      .select('true AS "following"')
      .from(UserFollow, 'follow')
      .where(
        '"follow"."followingId" = "user"."id" AND "follow"."followerId" = :userId',
        {
          userId: currentUser.id,
        },
      );

    query = query.addSelect(
      `coalesce((${subquery.getQuery()}), false) AS "following"`,
    );
  } else {
    query = query.addSelect(`false AS "following"`);
  }

  if (params.username)
    query = query.andWhere('"user"."username" = :username', {
      username: params.username,
    });

  return query;
};

export const profileRepo: ProfileRepo = {
  async getProfileByUsername(username, currentUser) {
    const query = buildProfileQuery({ username }, currentUser);
    const profile = await query.getRawOne();
    if (!profile) throw new NotFoundError();
    return profile;
  },

  async followByUsername(username, currentUser) {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundError();

    const followRepo = getRepository(UserFollow);
    const follow = followRepo.create({
      followerId: currentUser.id,
      followingId: user.id,
    });
    await followRepo.save(follow);

    return {
      ...user,
      following: true,
    };
  },

  async unfollowByUsername(username, currentUser) {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundError();

    const followRepo = getRepository(UserFollow);
    await followRepo.delete({
      followerId: currentUser.id,
      followingId: user.id,
    });

    return {
      ...user,
      following: false,
    };
  },
};
