import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from 'app/user/user.types';
import { OrmInterface } from 'orms/types';

export type Request = FastifyRequest & { orm: OrmInterface };

export type RequestHandler = (request: Request, reply: FastifyReply) => unknown;

export type AuthorizedRequest = Request & {
  user: User;
  userToken: string;
};

export type AuthorizedHandler = (
  request: AuthorizedRequest,
  reply: FastifyReply,
) => unknown;
