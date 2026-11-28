import tls from 'node:tls';
import { AsyncLocalStorage } from 'node:async_hooks';
import mysql, { Connection, ConnectionOptions } from 'mysql2/promise';

// ─── CLOUDFLARE WORKERS TLS SHIM ─────────────────────────────────────────────
// Cloudflare Workers (workerd) does not implement checkServerIdentity.
// Stripping it allows mysql2 to connect to TiDB Cloud over TLS without throwing:
// "Error: The options.checkServerIdentity option is not implemented"
// Ref: https://developers.cloudflare.com/workers/runtime-apis/nodejs/tls/
// Installed only inside workerd: on Node the option works, and patching the
// process-global tls.connect there would reach SMTP and R2 connections too.
const isWorkerd =
  typeof navigator !== 'undefined' && (navigator as { userAgent?: string }).userAgent === 'Cloudflare-Workers';
if (isWorkerd && tls && tls.connect) {
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

// ─── ONE CONNECTION PER REQUEST ──────────────────────────────────────────────
// Opening a TLS connection to TiDB costs ~300 ms; a query on an open one ~80 ms.
// A global pool can't be used (a Worker isolate serves unrelated requests and
// Cloudflare rejects I/O objects crossing request contexts), so each request
// gets its own connection, opened on first use and closed when it finishes.
const requestDb = new AsyncLocalStorage<{ conn?: Promise<Connection> }>();

/**
 * Wraps a route handler so every `query()` in that request shares one
 * connection. Transactions still use their own connection.
 */
export function withDb<A extends unknown[], R>(handler: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return (...args: A) => {
    const scope: { conn?: Promise<Connection> } = {};
    return requestDb.run(scope, async () => {
      try {
        return await handler(...args);
      } finally {
        if (scope.conn) {
          const conn = await scope.conn.catch(() => null);
          await conn?.end().catch(() => {});
        }
      }
    });
  };
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const scope = requestDb.getStore();
  if (scope) {
    scope.conn ??= createDbConnection();
    const [results] = await (await scope.conn).execute(sql, params);
    return results as T;
  }
  // Outside a wrapped handler (scripts, server components): one connection per query.
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
