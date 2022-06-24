# ORMs overview

Implement [real world API](https://github.com/gothinkster/realworld) with different node.js ORMs to compare them.

Code for ORMs you can find in `src/orms`, for benchmark `src/benchmarks`, tests are in `src/tests`.

Article about this overview: [link](https://romeerez.hashnode.dev/nodejs-orms-overview-and-comparison)

## Prepare

```sh
npm i # install deps
sudo systemctl start postgresql # make sure you have postgres and it's running
cp .env.example .env # create env file and make sure it has correct db credentials
npm run db create # will create one database for development and second for tests
npm run db migrate # run migrations
```

## Tests

Every endpoint is covered with test, see "scripts" section in package.json to run specific tests, like:

```sh
npm run test:sequelize
```

## Benchmarks

```sh
npm run bench:select # measure selecting articles
npm run bench:insert # measure inserting articles
```
