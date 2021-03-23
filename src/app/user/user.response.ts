import { User } from 'app/user/user.types';

export const user = (user: User, token: string) => ({
  user: {
    email: user.email,
    username: user.username,
    bio: user.bio,
    image: user.image,
    token,
  },
});
