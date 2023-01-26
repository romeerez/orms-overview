import { Client } from 'pg';
import { orms } from '../orms/orms';
import { OrmName } from '../orms/types';

export const ormNames = Object.keys(orms) as OrmName[];

export async function clearDb(db: Client, tables: string[]) {
  for (const table of tables) {
    await db.query(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}

export async function connectAllORMs() {
  for (const ormName of ormNames) {
    await orms[ormName].initialize?.();
  }
}

export async function disconnectAllORMs() {
  for (const ormName of ormNames) {
    await orms[ormName].close?.();
  }
}

export function getMs() {
  const time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

export function formatMs(ms: number) {
  return `${Math.round(ms)}ms`;
}
