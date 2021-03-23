import { string } from 'lib/yup';

export const user = {
  username: string().min(3).max(30),
  email: string().email(),
  password: string().min(5).max(30),
  bio: string().max(1000),
  image: string().max(1000),
};
