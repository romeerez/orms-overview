import { config } from 'dotenv';
import path from 'path';
import { rakeDb } from 'rake-db';

config({ path: path.resolve(process.cwd(), '.env.local') });
config();

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
  throw new Error('DATABASE_URL is missing in .env');
}

const databaseURLTest = process.env.DATABASE_URL_TEST;
if (!databaseURLTest) {
  throw new Error('DATABASE_URL_TEST is missing in .env');
}

rakeDb([{ databaseURL }, { databaseURL: databaseURLTest }]);
