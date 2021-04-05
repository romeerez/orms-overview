import { Client, Pool, QueryArrayConfig, QueryConfig } from 'pg';
import config from 'config';

let savePoints: string[] | undefined;
let client: Client;
let poolConnection: any;
let connected = false;
let connectPromise: Promise<void>;

export const patchPgClient = () => {
  const { connect, query } = Client.prototype;

  Client.prototype.connect = async function (
    this: Client,
    cb: (err: Error | undefined, connection: Client) => void,
  ) {
    if (!client) client = this;

    if (connected) {
      if (cb) cb(undefined, client);
      return;
    }

    if (connectPromise) {
      await connectPromise;
      if (cb) cb(undefined, client);
      return;
    }

    connectPromise = new Promise((resolve, reject) => {
      connect.call(client, (err) => {
        if (err) reject(err);
        else {
          connected = true;
          if (cb) cb(undefined, client);
        }
      });
    });
  } as typeof Client.prototype.connect;

  const poolConnect = Pool.prototype.connect;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getPoolConnection(this: any, cb: (...args: any[]) => void) {
    if (!poolConnection)
      poolConnection = await (poolConnect as any).call(this as any);

    if (cb) cb(undefined, poolConnection, () => {});

    poolConnection.release = () => {};

    return poolConnection;
  }

  Pool.prototype.connect = getPoolConnection as typeof Pool.prototype.connect;

  Client.prototype.query = async function (
    inputArg: string | QueryConfig<any> | QueryArrayConfig<any>,
    ...args: any[]
  ) {
    let input = inputArg;
    let sql = typeof input === 'string' ? input : input.text;
    sql = sql.trim();

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

    if (typeof input === 'string') {
      input = sql;
    } else {
      input.text = sql;
    }

    const connection = await (getPoolConnection as any).call(this);
    return await (query as any).call(connection, input, ...args);
  };
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
  client?.end();
};
