import './extend-fastify';
import fastify from 'fastify';
import 'dotenv/config';
import routes from 'routes';
import config from 'config';
import errorHandler from 'errorHandler';
import { orms } from 'orms/orms';
import { OrmName } from 'orms/types';
// for typeorm
import 'reflect-metadata';
import { dbPromise } from './orms/mikroorm/db';

const server = fastify();

server.register(routes);

server.addHook('onRequest', async (req, res) => {
  if (
    req.headers['content-type'] === 'application/json' &&
    req.headers['content-length'] === '0'
  ) {
    req.headers['content-type'] = 'empty';
  }

  const ormName = req.headers['x-orm'] || 'mikroorm';
  const orm = orms[ormName as OrmName];
  if (!orm) throw new Error(`Unsupported orm name provided: ${ormName}`);

  req.orm = orm;
  if (ormName === 'mikroorm') {
    req.meta = { em: (await dbPromise).em.fork() };
  }
});

server.addContentTypeParser('empty', ((
  req: unknown,
  res: unknown,
  done: () => unknown,
) => {
  done();
}) as any); // eslint-disable-line

// eslint-disable-next-line
server.setErrorHandler(errorHandler as any);

if (!config.env.test) {
  server.listen(process.env.PORT || 3000, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

export default server;
