import { OrmInterface } from 'orms/types';
import { EntityManager } from '@mikro-orm/postgresql';

declare module 'fastify' {
  interface FastifyRequest {
    orm: OrmInterface;
    meta: { em: EntityManager };
  }
}
