import 'dotenv/config';
import {
  patchPgClient,
  startTransaction,
  rollbackTransaction,
  closePg,
} from 'tests/utils/patch-pg';
import { isUnpatchableOrm } from './src/tests/utils/constants';
import { db } from 'tests/utils/db';

if (!isUnpatchableOrm) {
  patchPgClient();
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
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });
}

afterAll(async () => {
  if (orm.close) orm.close();
  closePg();
  await db.end();
});
