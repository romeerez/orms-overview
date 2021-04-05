import knex from 'knex';
import config from 'config';

export const db = knex({
  client: 'pg',
  connection: config.dbUrl,
});
