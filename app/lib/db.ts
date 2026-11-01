import tls from 'node:tls';
import mysql, { Connection, ConnectionOptions } from 'mysql2/promise';

// ─── CLOUDFLARE WORKERS TLS SHIM ─────────────────────────────────────────────
// Cloudflare Workers (workerd) does not implement checkServerIdentity.
// Stripping it allows mysql2 to connect to TiDB Cloud over TLS without throwing:
// "Error: The options.checkServerIdentity option is not implemented"
// Ref: https://developers.cloudflare.com/workers/runtime-apis/nodejs/tls/
if (tls && tls.connect) {
  const originalTlsConnect = tls.connect;
  tls.connect = function (...args: any[]) {
    for (const arg of args) {
      if (arg && typeof arg === 'object' && 'checkServerIdentity' in arg) {
        delete arg.checkServerIdentity;
      }
    }
    return (originalTlsConnect as any).apply(this, args);
  };
}
// ─────────────────────────────────────────────────────────────────────────────

function getConnectionOptions(): ConnectionOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      '[db] DATABASE_URL environment variable is not set. ' +
      'Add it to the Cloudflare Worker secrets or a local environment file.'
    );
  }

  return {
    uri: databaseUrl,
    // Workers prohibit runtime code generation. Static packet parsing is
    // required by mysql2 in the Cloudflare runtime.
    disableEval: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  };
}

async function createDbConnection(): Promise<Connection> {
  return mysql.createConnection(getConnectionOptions());
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  // A Worker isolate can serve unrelated requests. Reusing a global Node pool
  // can carry an I/O object across request contexts, which Cloudflare rejects.
  const connection = await createDbConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results as T;
  } finally {
    await connection.end();
  }
}

export interface TxQuery {
  query<T = any>(sql: string, params?: any[]): Promise<T>;
}

/**
 * Runs `fn` inside one transaction and one request-scoped connection,
 * committing on success and rolling back if `fn` throws.
 */
export async function withTransaction<T>(fn: (tx: TxQuery) => Promise<T>): Promise<T> {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();
    const tx: TxQuery = {
      query: async (sql, params) => {
        const [results] = await connection.execute(sql, params);
        return results as any;
      },
    };
    const result = await fn(tx);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
