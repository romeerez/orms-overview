import { UserRepo } from 'orms/types';
import { User } from 'orms/typeorm/user/user.model';
import { getRepository } from 'typeorm';
import { UniqueViolationError } from 'errors';

export const userRepo: UserRepo = {
  async create(params) {
    const repo = getRepository(User);
    try {
      const user = repo.create(params);
      return await repo.save(user);
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        throw new UniqueViolationError(
          `User with such ${
            error.detail.includes('email') ? 'email' : 'username'
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

  async updateUser(user, params) {
    const repo = getRepository(User);
    return await repo.save({ ...user, ...params });
  },
};
