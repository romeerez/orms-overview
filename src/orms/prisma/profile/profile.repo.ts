import { ProfileRepo } from 'orms/types';
import { User, UserWithNulls } from 'app/user/user.types';
import { client } from 'orms/prisma/client';
import { Profile } from 'app/profile/profile.types';
import { NotFoundError } from 'errors';

export type ProfileResult = Pick<
  UserWithNulls,
  'id' | 'username' | 'bio' | 'image'
> & {
  userFollow_userTouserFollow_followingId?: unknown[];
};

export const mapProfileResult = (
  user: ProfileResult,
): Profile & { id: number } => ({
  ...user,
  image: user.image || undefined,
  bio: user.bio || undefined,
  following: Boolean(user.userFollow_userTouserFollow_followingId?.length),
});

export const getProfileQueryOptions = (currentUser?: User) => ({
  select: {
    id: true,
    username: true,
    bio: true,
    image: true,
    ...(currentUser
      ? {
          userFollow_userTouserFollow_followingId: {
            select: {
              followingId: true,
            },
            where: {
              followerId: currentUser.id,
            },
          },
        }
      : {}),
  },
});

const getProfileByUsername = async (username: string, currentUser?: User) => {
  const queryOptions = getProfileQueryOptions(currentUser);
  const profile = await client.user.findUnique({
    ...queryOptions,
    where: { username },
  });
  if (!profile) throw new NotFoundError();
  return mapProfileResult(profile);
};

export const profileRepo: ProfileRepo = {
  getProfileByUsername,

  async followByUsername(username, currentUser) {
    const profile = await getProfileByUsername(username, currentUser);
    if (!profile.following) {
      await client.userFollow.create({
        data: {
          followingId: profile.id,
          followerId: currentUser.id,
        },
      });
      profile.following = true;
    }

    return profile;
  },

  async unfollowByUsername(username, currentUser) {
    const profile = await getProfileByUsername(username, currentUser);
    if (profile.following) {
      await client.userFollow.deleteMany({
        where: {
          followingId: profile.id,
          followerId: currentUser.id,
        },
      });
      profile.following = false;
    }

    return profile;
  },
};
