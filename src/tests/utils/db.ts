import { Client, Pool } from 'pg';

const Connection = process.env.ORM !== 'sequelize' ? Pool : Client;

export const db = new Connection({
  connectionString: process.env.DATABASE_URL_TEST,
});
