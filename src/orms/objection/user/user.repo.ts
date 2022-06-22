import { UserRepo } from 'orms/types';
import { User } from 'orms/objection/user/user.model';
import { NotFoundError, UniqueViolationError } from 'errors';

export const userRepo: UserRepo = {
  async create(params) {
    try {
      // To prevent TS error "Type is excessively deep and can't be inferred"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return (await User.query().insertAndFetch(params)) as UserType;
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

  async findByEmail(email) {
    const user = await User.query().where('email', email).first();
    return user || undefined;
  },

  async findById(id: number) {
    const user = await User.query().where('id', id).first();
    if (!user) throw new NotFoundError();
    return user;
  },

  async updateUser({ id }, params) {
    const user = await User.query().updateAndFetchById(id, {
      ...params,
      bio: params.bio || undefined,
      image: params.image || undefined,
    });
    if (!user) throw new NotFoundError();
    return user;
  },
};
