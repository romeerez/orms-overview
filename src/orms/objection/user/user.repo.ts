import { UserRepo } from 'orms/types';
import { User } from 'orms/objection/user/user.model';
import { NotFoundError, UniqueViolationError } from 'errors';

export const userRepo: UserRepo = {
  async create(params) {
    try {
      return await User.query().insertAndFetch(params);
    } catch (error) {
      const err = error as { constraint: string };
      const username = err.constraint === 'userUsernameIndex';
      const email = err.constraint === 'userEmailIndex';
      if (username || email) {
        throw new UniqueViolationError(
          `User with such ${email ? 'email' : 'username'} already exists`,
        );
      }
      throw error;
    }
  },

  findByEmail(email) {
    return User.query().where('email', email).first();
  },

  async findById(id: number) {
    const user = await User.query().where('id', id).first();
    if (!user) throw new NotFoundError();
    return user;
  },

  updateUser(user, params) {
    return User.query().updateAndFetchById(user.id, params);
  },
};
