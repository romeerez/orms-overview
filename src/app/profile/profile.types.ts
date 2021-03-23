import { User } from 'app/user/user.types';

export type Profile = Omit<User, 'id' | 'email'> & { following: boolean };
