import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    pool.on("error", (err) => {
      console.error("[Database Pool] Unexpected error on idle client:", err.message);
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
