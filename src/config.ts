const nodeEnv = process.env.NODE_ENV;

export default {
  env: {
    production: nodeEnv === 'production',
    development: nodeEnv === 'development',
    test: nodeEnv === 'test',
  },

  dbUrl:
    nodeEnv === 'test'
      ? process.env.DATABASE_URL_TEST
      : process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,
};
