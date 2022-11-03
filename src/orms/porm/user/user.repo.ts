import { UserRepo } from '../../types';
import { db } from '../database';
import { UniqueViolationError } from '../../../errors';
import { User } from '../../../app/user/user.types';
import { columnTypes, raw } from 'pqb';
import { createRepo } from 'porm';

export const userRepo = createRepo(db.user, {
  defaultSelect(q, currentUser: User | undefined) {
    return q.select('username', 'bio', 'image', {
      following: currentUser
        ? (q) => q.followers.where({ followerId: currentUser.id }).exists()
        : raw(columnTypes.boolean(), 'false'),
    });
  },
});

export default {
  async create(params) {
    try {
      return await db.user.create(params);
    } catch (error) {
      const err = error as { constraint: string };
      const isEmail = err.constraint === 'userEmailIndex';
      const isUsername = err.constraint === 'userUsernameIndex';
      if (isEmail || isUsername) {
        throw new UniqueViolationError(
          `User with such ${isEmail ? 'email' : 'username'} already exists`,
        );
      }
      throw error;
    }
  },

  async findById(id) {
    return db.user.find(id).takeOptional();
  },

  async findByEmail(email) {
    return db.user.findBy({ email }).takeOptional();
  },

  async updateUser(user, params) {
    return await db.user.selectAll().find(user.id).update(params);
  },
} as UserRepo;
