import { RequestHandler } from 'types';
import validate from 'lib/validate';
import * as response from 'app/profile/profile.response';
import { object } from 'lib/yup';
import { user } from 'app/user/user.params';
import { getCurrentUser } from 'lib/currentUser';
import { authUser } from 'lib/decorators';

const usernameParam = object({
  username: user.username.required(),
});

export const getProfileByUsername: RequestHandler = async (request) => {
  const { username } = validate(usernameParam, request.params);
  const currentUser = await getCurrentUser(request);
  const profile = await request.orm.profileRepo.getProfileByUsername(
    username,
    currentUser,
  );
  return response.profile(profile);
};

export const followByUsername = authUser(async (request) => {
  const { username } = validate(usernameParam, request.params);
  const profile = await request.orm.profileRepo.followByUsername(
    username,
    request.user,
  );
  return response.profile(profile);
});

export const unfollowByUsername = authUser(async (request) => {
  const { username } = validate(usernameParam, request.params);
  const profile = await request.orm.profileRepo.unfollowByUsername(
    username,
    request.user,
  );
  return response.profile(profile);
});
