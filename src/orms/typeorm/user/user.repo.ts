import { UserRepo } from 'orms/types';
import { User } from 'orms/typeorm/user/user.model';
import { UniqueViolationError } from 'errors';
import { dataSource } from '../dataSource';
import { QueryFailedError } from 'typeorm';

export const userRepo: UserRepo = {
  async create(params) {
    const repo = dataSource.getRepository(User);
    try {
      const user = Object.assign(new User(), params);
      await repo.save(user);
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key')) {
          const isEmail = (error.driverError.messageDetail as string).includes(
            'email',
          );
          throw new UniqueViolationError(
            `User with such ${isEmail ? 'email' : 'username'} already exists`,
          );
        }
      }
      throw error;
    }
  },

  async findByEmail(email) {
    const repo = dataSource.getRepository(User);
    const user = await repo.findOneBy({ email });
    return user || undefined;
  },

  async findById(id) {
    const repo = dataSource.getRepository(User);
    const user = await repo.findOneBy({ id });
    return user || undefined;
  },

  async updateUser({ id }, params) {
    const repo = dataSource.getRepository(User);
    const user = await repo.findOneBy({ id });
    if (!user) throw new Error('not found');
    Object.assign(user, params);
    await repo.save(user);
    return user;
  },
};
