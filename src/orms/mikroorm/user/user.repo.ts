import { UserRepo } from '../../types';
import { User } from './user.model';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { UniqueViolationError } from '../../../errors';

export const userRepo: UserRepo = {
  async create(params, { em }) {
    try {
      const user = Object.assign(new User(), params);
      user.id = await em.nativeInsert(user);
      return user;
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        const isEmail = ((error as unknown) as {
          detail: string;
        }).detail.includes('email');
        throw new UniqueViolationError(
          `User with such ${isEmail ? 'email' : 'username'} already exists`,
        );
      }
      throw error;
    }
  },

  async findByEmail(email, { em }) {
    const user = await em.findOne(User, { email });
    return user || undefined;
  },

  async findById(id, { em }) {
    return await em.findOneOrFail(User, { id });
  },

  async updateUser({ id }, params, { em }) {
    const user = await em.findOne(User, { id });
    if (!user) throw new Error('not found');
    Object.assign(user, params);
    await em.persistAndFlush(user);
    return user;
  },
};
