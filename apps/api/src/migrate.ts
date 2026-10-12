import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createPool } from "./database.ts";

const pool = createPool();
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(35762819)");
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const directory = new URL("../migrations/", import.meta.url);
  for (const name of (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    const sql = await readFile(new URL(name, directory), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const result = await client.query(
      "SELECT checksum FROM schema_migrations WHERE name = $1",
      [name],
    );
    if (result.rowCount) {
      if (result.rows[0].checksum !== checksum)
        throw new Error(`Applied migration changed: ${name}`);
      continue;
    }
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)",
      [name, checksum],
    );
    console.log(`Applied ${name}`);
  }
  await client.query("COMMIT");
  console.log("Migrations up to date");
} catch {
  await client.query("ROLLBACK");
  console.error("Migration failed; transaction rolled back");
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
