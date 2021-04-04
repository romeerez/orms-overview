import 'dotenv/config';
import {
  patchPgClient,
  startTransaction,
  rollbackTransaction,
  closePg,
} from 'tests/utils/patch-pg';

patchPgClient();

import { orms } from 'orms/orms';
import { OrmName } from 'orms/types';

const ormName = (process.env.ORM || 'sequelize') as OrmName;
const orm = orms[ormName];
if (orm.initialize) {
  beforeAll(async () => {
    await orm.initialize!();
  });
}

if (ormName !== 'prisma') {
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
});
