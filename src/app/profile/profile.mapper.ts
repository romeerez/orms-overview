import { User } from 'app/user/user.types';

export const userToProfile = (user: User, following: boolean) => ({
  username: user.username,
  bio: user.bio,
  image: user.image,
  following,
});
