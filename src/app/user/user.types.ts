export type User = {
  id: number;
  email: string;
  username: string;
  bio?: string;
  image?: string;
};

export type UserWithNulls = {
  id: number;
  email: string;
  username: string;
  bio?: string | null;
  image?: string | null;
};

export type UserWithPassword = User & {
  password: string;
};

export type UserFollow = {
  followerId: number;
  followingId: number;
};
