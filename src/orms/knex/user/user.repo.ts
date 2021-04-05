import { UserRepo } from 'orms/types';
import { db } from 'orms/knex/db';
import { NotFoundError, UniqueViolationError } from 'errors';

export const userRepo: UserRepo = {
  async create(params) {
    try {
      const [user] = await db('user').insert(params).returning('*');
      return user;
    } catch (error) {
      const username = error.constraint === 'userUsernameIndex';
      const email = error.constraint === 'userEmailIndex';
      if (username || email) {
        throw new UniqueViolationError(
          `User with such ${email ? 'email' : 'username'} already exists`,
        );
      }
      throw error;
    }
  },

  findById(id) {
    return db('user').where('id', id).first();
  },

  findByEmail(email) {
    return db('user').where('email', email).first();
  },

  async updateUser(user, params) {
    await db('user').update(params);
    const updated = await userRepo.findById(user.id);
    if (!updated) throw new NotFoundError();
    return updated;
  },
};
