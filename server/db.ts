import { Pool, type PoolClient } from "pg";

// Global connection pool - initialized once
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Limit connections to prevent exhaustion
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on("error", (err) => {
      console.error("[Database Pool] Unexpected error:", err.message);
      // Don't exit - let app continue but log the issue
    });

    pool.on("connect", () => {
      // Connection acquired
    });
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
      console.log("[Database] Connection pool closed");
    } catch (err) {
      console.error("[Database] Error closing pool:", err instanceof Error ? err.message : err);
    }
    pool = null;
  }
}

export async function queryPool(
  text: string,
  values?: any[]
): Promise<{ rows: any[]; rowCount: number | null }> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, values);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
}
