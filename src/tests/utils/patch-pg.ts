import { Client, Pool } from 'pg';
import config from 'config';

let savePoints: string[] | undefined;
let connection: any;
let poolConnection: any;

export const patchPgClient = () => {
  const { connect, query } = Client.prototype;

  Client.prototype.connect = async function (cb) {
    if (connection) return cb();

    connection = await connect.call(this);
    if (cb) cb();
    return;
  } as typeof Client.prototype.connect;

  const poolConnect = Pool.prototype.connect;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getPoolConnection(cb: (...args: any[]) => void) {
    if (!poolConnection) poolConnection = await poolConnect.call(this);

    if (cb) cb(undefined, poolConnection, () => {});

    poolConnection.release = () => {};

    return poolConnection;
  }

  Pool.prototype.connect = getPoolConnection as typeof Pool.prototype.connect;

  Client.prototype.query = async function (input, ...args) {
    let sql = input.trim();

    if (sql.startsWith('START TRANSACTION') || sql.startsWith('BEGIN')) {
      if (savePoints) {
        const savePoint = Math.random().toString(36).substring(2, 15);
        savePoints.push(savePoint);
        sql = `SAVEPOINT "${savePoint}"`;
      } else {
        savePoints = [];
      }
    } else {
      const isCommit = sql.startsWith('COMMIT');
      const isRollback = !isCommit && sql.startsWith('ROLLBACK');
      if (isCommit || isRollback) {
        if (!savePoints) {
          throw new Error(
            `Trying to ${
              isCommit ? 'COMMIT' : 'ROLLBACK'
            } outside of transaction`,
          );
        } else {
          if (savePoints.length) {
            const savePoint = savePoints.pop();
            sql = `${
              isCommit ? 'RELEASE' : 'ROLLBACK TO'
            } SAVEPOINT "${savePoint}"`;
          } else {
            savePoints = undefined;
          }
        }
      }
    }

    const connection = await getPoolConnection.call(this);
    return await query.call(connection, sql, ...args);
  } as typeof Client.prototype.query;
};

export const startTransaction = async (
  db = new Pool({ connectionString: config.dbUrl }),
) => {
  await rollbackTransaction(db);
  await db.query('BEGIN');
};

export const rollbackTransaction = async (
  db = new Pool({ connectionString: config.dbUrl }),
) => {
  while (savePoints) await db.query('ROLLBACK');
};

export const closePg = () => {
  poolConnection?.end();
  connection?.end();
};
