import mysql, { Pool } from "mysql2/promise";

let pool: Pool;

export function getDbPool(): Pool {
  if (!pool) {
    const databaseUrl =
      process.env.DATABASE_URL ||
      "mysql://2FBvMPqbV12TChu.root:MwyPwunFwJbIov9k@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/darshana_optical";

    pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    });
  }

  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const db = getDbPool();
  const [results] = await db.execute(sql, params);
  return results as T;
}
