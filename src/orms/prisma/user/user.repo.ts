import { UserRepo } from 'orms/types';
import { client } from 'orms/prisma/client';
import { UniqueViolationError } from 'errors';

export const userRepo: UserRepo = {
  async create(params) {
    try {
      return await client.user.create({
        data: params,
      });
    } catch (error) {
      const target = (error as { meta: { target: string } }).meta?.target;
      const email = target?.includes('email');
      const username = target?.includes('username');
      if (email || username) {
        throw new UniqueViolationError(
          `User with such ${email ? 'email' : 'username'} already exists`,
        );
      }
      throw error;
    }
  },

  async findByEmail(email) {
    const user = await client.user.findUnique({
      where: { email },
    });
    return user || undefined;
  },

  async findById(id) {
    const user = await client.user.findUnique({
      where: { id },
    });
    return user || undefined;
  },

  updateUser(user, data) {
    return client.user.update({
      where: {
        id: user.id,
      },
      data,
    });
  },
};
