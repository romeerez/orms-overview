import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from 'app/user/user.types';

export type RequestHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => void | Promise<unknown>;

export type AuthorizedRequest = FastifyRequest & {
  user: User;
  userToken: string;
};

export type AuthorizedHandler = (
  request: AuthorizedRequest,
  reply: FastifyReply,
) => unknown;
