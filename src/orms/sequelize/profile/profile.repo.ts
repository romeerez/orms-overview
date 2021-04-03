import { User } from 'orms/sequelize/user/user.model';
import { UserFollow } from 'orms/sequelize/user/userFollow.model';
import { NotFoundError } from 'errors';
import { ProfileRepo } from 'orms/types';
import { userToProfile } from 'app/profile/profile.mapper';

export const profileRepo: ProfileRepo = {
  async getProfileByUsername(username, currentUser) {
    // eslint-disable-next-line
    const include: any = [];

    if (currentUser) {
      include.push({
        required: false,
        model: UserFollow,
        as: 'followedBy',
        where: {
          followerId: currentUser.id,
        },
      });
    }

    const user = <User & { followedBy: { followerId?: number }[] }>(
      await User.findOne({
        where: { username },
        include,
      })
    );

    if (!user) throw new NotFoundError();

    const following = currentUser
      ? Boolean(user.followedBy[0].followerId)
      : false;

    return userToProfile(<User>user.toJSON(), following);
  },

  async followByUsername(username, currentUser) {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) throw new NotFoundError();

    await UserFollow.create({
      followerId: currentUser.id,
      followingId: user.id,
    });

    return userToProfile(<User>user.toJSON(), true);
  },

  async unfollowByUsername(username, currentUser) {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) throw new NotFoundError();

    await UserFollow.destroy({
      where: {
        followerId: currentUser.id,
        followingId: user.id,
      },
    });

    return userToProfile(<User>user.toJSON(), false);
  },
};
