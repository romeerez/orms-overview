import fastify from 'fastify';
import 'dotenv/config';
import routes from 'routes';
import config from 'config';
import errorHandler from 'errorHandler';
import { orms } from 'orms/orms';
import { OrmName } from 'orms/types';
import { Request } from 'types';

const server = fastify();

server.register(routes);

server.addHook('onRequest', async (req: Request) => {
  if (
    req.headers['content-type'] === 'application/json' &&
    req.headers['content-length'] === '0'
  ) {
    req.headers['content-type'] = 'empty';
  }

  const ormName = req.headers['x-orm'] || 'sequelize';
  const orm = orms[ormName as OrmName];
  if (!orm) throw new Error(`Unsupported orm name provided: ${ormName}`);

  req.orm = orm;
});

server.addContentTypeParser('empty', ((req, res, done) => {
  done();
}) as any); // eslint-disable-line

server.setErrorHandler(errorHandler);

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
