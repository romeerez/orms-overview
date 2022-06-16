import { RequestHandler } from 'types';
import { object } from 'lib/yup';
import validate from 'lib/validate';
import * as response from 'app/user/user.response';
import { createToken } from 'lib/jwt';
import { user } from 'app/user/user.params';
import { authUser } from 'lib/decorators';
import { comparePassword, encryptPassword } from 'lib/password';
import { ValidationError } from 'yup';

const createParams = object({
  user: object({
    username: user.username.required(),
    email: user.email.required(),
    password: user.password.required(),
    bio: user.bio,
    image: user.image,
  }),
});

export const register: RequestHandler = async (request) => {
  const { user: params } = validate(createParams, request.body);
  const user = await request.orm.userRepo.create(
    {
      ...params,
      password: await encryptPassword(params.password),
    },
    request.meta,
  );
  const token = createToken({ id: user.id, email: user.email });
  return response.user(user, token);
};

const loginParams = object({
  user: object({
    email: user.email.required(),
    password: user.password.required(),
  }),
});

export const login: RequestHandler = async (request) => {
  const { user: params } = validate(loginParams, request.body);

  const user = await request.orm.userRepo.findByEmail(
    params.email,
    request.meta,
  );
  if (!user || !(await comparePassword(params.password, user.password))) {
    throw new ValidationError('Email or password is invalid');
  }

  const token = createToken({ id: user.id, email: user.email });
  return response.user(user, token);
};

export const getCurrentUser = authUser((request) => {
  return response.user(request.user, request.userToken);
});

const updateParams = object({
  user: object({
    username: user.username,
    email: user.email,
    password: user.password,
    bio: user.bio,
    image: user.image,
  }),
});

export const update = authUser(async (request) => {
  const { user: params } = validate(updateParams, request.body);
  if (params.password) params.password = await encryptPassword(params.password);

  const user = await request.orm.userRepo.updateUser(
    request.user,
    params,
    request.meta,
  );

  return response.user(user, request.userToken);
});
