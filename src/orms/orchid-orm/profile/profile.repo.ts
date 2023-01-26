import { ProfileRepo } from '../../types';
import { db } from '../database';
import { NotFoundError } from '../../../errors';
import { userRepo } from '../user/user.repo';

export default {
  async getProfileByUsername(username, currentUser) {
    const profile = await userRepo.defaultSelect(currentUser).findByOptional({
      username,
    });

    if (!profile) throw new NotFoundError();

    return profile;
  },

  async followByUsername(username, currentUser) {
    const result = await userRepo
      .defaultSelect(currentUser)
      .findByOptional({
        username,
      })
      .select('id');

    if (!result) throw new NotFoundError();

    const { id, ...profile } = result;

    if (!profile.following) {
      await db.userFollow.create({
        followingId: id,
        followerId: currentUser.id,
      });

      profile.following = true;
    }

    return profile;
  },

  async unfollowByUsername(username, currentUser) {
    const result = await userRepo
      .defaultSelect(currentUser)
      .findByOptional({
        username,
      })
      .select('id');

    if (!result) throw new NotFoundError();

    const { id, ...profile } = result;

    if (profile.following) {
      await db.userFollow
        .findBy({ followingId: id, followerId: currentUser.id })
        .delete();

      profile.following = false;
    }

    return profile;
  },
} as ProfileRepo;
