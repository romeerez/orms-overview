import { get, postPublic, put } from 'tests/utils/request';
import { userSchema } from 'tests/utils/schemas';
import { randomString } from 'tests/utils/randomString';
import { currentUser } from 'tests/factories/user.factory';
import { db } from 'tests/utils/db';
import { clearDatabase } from 'tests/utils/for-prisma';

describe('user endpoints', () => {
  clearDatabase();

  describe('POST /users', () => {
    describe('registration', () => {
      afterAll(async () => {
        if (process.env.ORM === 'prisma') {
          await db.query(
            `DELETE FROM "user" WHERE "email" = 'email@example.com'`,
          );
        }
      });

      it('should register user', async () => {
        await postPublic('/users', {
          body: {
            user: {
              username: 'create-user',
              email: 'email@example.com',
              password: 'password',
            },
          },
          schema: userSchema,
        });
      });
    });

    test.each`
      field         | minLength
      ${'username'} | ${3}
      ${'password'} | ${5}
    `('$field validation', async ({ field, minLength }) => {
      let { data } = await postPublic('/users', {
        body: {
          user: {},
        },
      });
      expect(data.errors[field]).toBe(`${field} is a required field`);

      ({ data } = await postPublic('/users', {
        body: {
          user: { [field]: randomString(2) },
        },
      }));
      expect(data.errors[field]).toBe(
        `${field} must be at least ${minLength} characters`,
      );

      ({ data } = await postPublic('/users', {
        body: {
          user: { [field]: randomString(31) },
        },
      }));
      expect(data.errors[field]).toBe(`${field} must be at most 30 characters`);

      if (field === 'username') {
        ({ data } = await postPublic('/users', {
          body: {
            user: {
              email: 'example@mail.com',
              username: currentUser.username,
              password: 'password',
            },
          },
        }));
        expect(data.error).toBe('User with such username already exists');
      }
    });

    test('email validation', async () => {
      let { data } = await postPublic('/users', {
        body: {
          user: {},
        },
      });
      expect(data.errors.email).toBe('email is a required field');

      ({ data } = await postPublic('/users', {
        body: {
          user: { email: 'not-email' },
        },
      }));
      expect(data.errors.email).toBe('email must be a valid email');

      ({ data } = await postPublic('/users', {
        body: {
          user: {
            email: currentUser.email,
            username: 'validate-email',
            password: 'password',
          },
        },
      }));
      expect(data.error).toBe('User with such email already exists');
    });
  });

  describe('POST /users/login', () => {
    test('login ok', async () => {
      await postPublic('/users/login', {
        body: {
          user: {
            email: currentUser.email,
            password: currentUser.password,
          },
        },
        schema: userSchema,
      });
    });

    test.each`
      field
      ${'email'}
      ${'password'}
    `('empty $field', async ({ field }) => {
      const { data } = await postPublic('/users/login', {
        body: {
          user: {},
        },
      });
      expect(data.errors[field]).toBe(`${field} is a required field`);
    });

    test.each`
      field
      ${'email'}
      ${'password'}
    `('invalid email or password', async ({ field }) => {
      const { data } = await postPublic('/users/login', {
        body: {
          user: {
            email: field === 'email' ? 'invalid@mail.com' : currentUser.email,
            password: field === 'password' ? 'invalid' : currentUser.password,
          },
        },
      });
      expect(data.error).toBe('Email or password is invalid');
    });
  });

  test('GET /user', async () => {
    await get('/user', { schema: userSchema });
  });

  describe('PUT /user', () => {
    test('update success', async () => {
      const params = {
        email: 'jake@jake.jake',
        username: 'jake',
        password: 'new-password',
        image: 'https://i.stack.imgur.com/xHWG8.jpg',
        bio: 'I like to skateboard',
      };

      await put('/user', {
        body: {
          user: params,
        },
        schema: userSchema,
      });

      const {
        data: { user: updated },
      } = await get('/user');

      const { password, ...paramsWithoutPassword } = params;
      expect(updated).toMatchObject(paramsWithoutPassword);

      await postPublic('/users/login', {
        token: updated.token,
        body: {
          user: {
            email: params.email,
            password: params.password,
          },
        },
        schema: userSchema,
      });
    });
  });
});
