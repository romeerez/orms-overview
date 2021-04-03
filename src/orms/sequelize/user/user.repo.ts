import { User } from 'orms/sequelize/user/user.model';
import { UniqueConstraintError } from 'sequelize';
import { UserWithPassword } from 'app/user/user.types';
import { UniqueViolationError } from 'errors';
import { UserRepo } from 'orms/types';

export const userRepo: UserRepo = {
  async create(params) {
    try {
      const userWithPassword = await User.create(params);
      return <UserWithPassword>userWithPassword.toJSON();
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new UniqueViolationError(
          `User with such ${
            error.fields.email ? 'email' : 'username'
          } already exists`,
        );
      }
      throw error;
    }
  },

  async findByEmail(email) {
    return <UserWithPassword>await User.findOne({ where: { email } });
  },

  async findById(id) {
    const user = await User.findByPk(id);
    return user ? <UserWithPassword>user.toJSON() : undefined;
  },

  async updateUser(user, params) {
    const updated = { ...user, ...params };
    await User.update(params, { where: { id: user.id } });
    delete updated.password;
    return updated;
  },
};
