import pg from "pg";

export function createPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3000,
    query_timeout: 3000,
    max: 5,
  });
  pool.on("error", () => console.error("Database connection unavailable"));
  return pool;
}
