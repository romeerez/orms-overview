import { config } from 'dotenv';
import path from 'path';
import { rakeDb } from 'rake-db';

config({ path: path.resolve(process.cwd(), '.env.local') });
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing in .env');
}

const databaseUrlTest = process.env.DATABASE_URL_TEST;
if (!databaseUrlTest) {
  throw new Error('DATABASE_URL_TEST is missing in .env');
}

const registered = false;

rakeDb([
  { connectionString: databaseUrl },
  { connectionString: databaseUrlTest },
]);
