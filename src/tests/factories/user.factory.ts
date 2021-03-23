import { Factory } from 'fishery';
import { UserWithPassword } from 'app/user/user.types';
import { create } from 'tests/utils/create';

export const userFactory = Factory.define<
  UserWithPassword,
  { followedBy?: { id: number }[] }
>(({ sequence, onCreate, transientParams }) => {
  onCreate(async (params) => {
    const user = await create<UserWithPassword>('user', params);

    const { followedBy } = transientParams;
    if (followedBy)
      await create(
        'userFollow',
        followedBy.map(({ id }) => ({
          followerId: id,
          followingId: user.id,
        })),
      );

    return user;
  });

  return {
    id: sequence,
    username: `username-${sequence}`,
    email: `email-${sequence}@mail.com`,
    password: 'password',
  };
});

export const currentUser = userFactory.build();
