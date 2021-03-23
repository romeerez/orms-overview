import { AuthorizedHandler, AuthorizedRequest, RequestHandler } from 'types';
import { UnauthorizedError } from 'errors';
import { getCurrentUserAndToken } from 'lib/currentUser';

export const authUser = (handler: AuthorizedHandler): RequestHandler => async (
  request: AuthorizedRequest,
  reply,
) => {
  const result = await getCurrentUserAndToken(request);
  if (result) {
    request.userToken = result.token;
    request.user = result.user;
    return handler(request, reply);
  } else {
    throw new UnauthorizedError('Unauthorized');
  }
};
