import { OrmInterface } from 'orms/types';

declare module 'fastify' {
  interface FastifyRequest {
    orm: OrmInterface;
  }
}
