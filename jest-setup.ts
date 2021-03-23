import 'dotenv/config';
import {
  patchPgClient,
  startTransaction,
  rollbackTransaction,
  closePg,
} from 'tests/utils/patch-pg';
import { orms } from 'orms/orms';

patchPgClient();

beforeAll(() => {
  Object.keys(orms).forEach((key) => orms[key].initialize());
});

beforeEach(async () => {
  await startTransaction();
});

afterEach(async () => {
  await rollbackTransaction();
});

afterAll(async () => {
  closePg();
  Object.keys(orms).forEach((key) => orms[key].close());
});
