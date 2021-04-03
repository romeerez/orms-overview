import { AuthorizedHandler, AuthorizedRequest, RequestHandler } from 'types';
import { UnauthorizedError } from 'errors';
import { getCurrentUserAndToken } from 'lib/currentUser';
import { FastifyRequest } from 'fastify';

export const authUser = (handler: AuthorizedHandler): RequestHandler => async (
  request: FastifyRequest,
  reply,
) => {
  const result = await getCurrentUserAndToken(request);
  if (result) {
    const req = request as AuthorizedRequest;
    req.userToken = result.token;
    req.user = result.user;
    return handler(req, reply);
  } else {
    throw new UnauthorizedError('Unauthorized');
  }
};
