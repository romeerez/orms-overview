import { Generated } from 'kysely';

export interface User {
  id: Generated<number>;
  email: string;
  username: string;
  password: string;
  bio: string;
  image: string;
}
