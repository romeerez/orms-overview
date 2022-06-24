import assert from 'assert';

const nodeEnv = process.env.NODE_ENV;

const dbUrl =
  nodeEnv === 'test' ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL;

assert(dbUrl);

const jwtSecret = process.env.JWT_SECRET;
assert(jwtSecret);

const env = {
  production: nodeEnv === 'production',
  development: nodeEnv === 'development',
  test: nodeEnv === 'test',
};

export default {
  env,
  startServer: !env.test,
  dbUrl,
  jwtSecret,
};
