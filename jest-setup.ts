import 'dotenv/config';
import {
  patchPgForTransactions,
  startTransaction,
  rollbackTransaction,
} from 'pg-transactional-tests';
import { isUnpatchableOrm } from './src/tests/utils/constants';
import { db } from 'tests/utils/db';

if (!isUnpatchableOrm) {
  patchPgForTransactions();
}

import { orms } from 'orms/orms';
import { OrmName } from 'orms/types';

const ormName = (process.env.ORM || 'sequelize') as OrmName;
const orm = orms[ormName];
if (orm.initialize) {
  beforeAll(async () => {
    await orm.initialize!();
  });
}

if (!isUnpatchableOrm) {
  beforeEach(async () => {
    await startTransaction(db);
  });

  afterEach(async () => {
    await rollbackTransaction(db);
  });
}

afterAll(async () => {
  if (orm.close) orm.close();
  await db.end();
});
