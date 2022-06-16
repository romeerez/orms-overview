import { UserRepo } from 'orms/types';
import { User } from 'orms/typeorm/user/user.model';
import { getRepository } from 'typeorm';
import { UniqueViolationError } from 'errors';

export const userRepo: UserRepo = {
  async create(params) {
    const repo = getRepository(User);
    try {
      const user = Object.assign(new User(), params);
      await repo.save(user);
      return user;
    } catch (error) {
      if ((error as { message: string }).message.includes('duplicate key')) {
        throw new UniqueViolationError(
          `User with such ${
            (error as { detail: string }).detail.includes('email')
              ? 'email'
              : 'username'
          } already exists`,
        );
      }
      throw error;
    }
  },

  async findByEmail(email) {
    const repo = getRepository(User);
    return await repo.findOne({ email });
  },

  async findById(id) {
    const repo = getRepository(User);
    return await repo.findOne(id);
  },

  async updateUser({ id }, params) {
    const repo = getRepository(User);
    const user = await repo.findOne(id);
    if (!user) throw new Error('not found');
    Object.assign(user, params);
    await repo.save(user);
    return user;
  },
};
