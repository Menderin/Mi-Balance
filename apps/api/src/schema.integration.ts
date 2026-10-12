import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import pg from "pg";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";

// This command is deliberately limited to the isolated Compose database.
const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "db", "Run only in Compose against local db");
assert.equal(url.pathname, "/mi_balance");
const database = `mi_balance_test_${randomUUID().replaceAll("-", "")}`;
const admin = new pg.Pool({ connectionString: url.toString() });
await admin.query(`CREATE DATABASE "${database}"`);
url.pathname = `/${database}`;
const pool = new pg.Pool({ connectionString: url.toString() });
try {
  const directory = new URL("../migrations/", import.meta.url);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const name of (await readdir(directory))
      .filter((name) => name.endsWith(".sql"))
      .sort()) {
      await client.query(await readFile(new URL(name, directory), "utf8"));
    }
    await client.query("COMMIT");
  } finally {
    client.release();
  }

  const auth = betterAuth({
    database: pool,
    secret: "local-schema-test-secret-32-characters",
    baseURL: "http://localhost:8080",
    emailAndPassword: { enabled: true },
  });
  const schema = await getMigrations(auth.options);
  assert.equal(schema.toBeCreated.length, 0, "Missing Better Auth tables");
  assert.equal(schema.toBeAdded.length, 0, "Missing Better Auth fields");
  console.log("Better Auth schema compatible");

  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ('a', 'Ana', 'ana@example.test'), ('b', 'Bea', 'bea@example.test')`,
  );
  const accountA = randomUUID(),
    accountB = randomUUID(),
    expense = randomUUID(),
    refund = randomUUID();
  await pool.query(
    "INSERT INTO financial_accounts(id,user_id,name,initial_balance,start_date) VALUES ($1,'a','Principal',100000,'2026-01-01'),($2,'b','Principal',0,'2026-01-01')",
    [accountA, accountB],
  );
  await pool.query(
    "INSERT INTO transactions(id,account_id,type,amount,description,category_id,category_type,occurred_on) VALUES ($1,$2,'expense',50000,'Compra','hardware','expense','2026-01-10')",
    [expense, accountA],
  );
  await pool.query(
    "INSERT INTO transactions(id,account_id,type,amount,description,original_expense_id,occurred_on) VALUES ($1,$2,'refund',10000,'Devolución',$3,'2026-02-01')",
    [refund, accountA, expense],
  );
  const balance = async () =>
    (
      await pool.query(
        "SELECT balance FROM financial_balances WHERE account_id=$1",
        [accountA],
      )
    ).rows[0].balance;
  assert.equal(await balance(), "60000");
  async function rejects(sql: string, params: unknown[] = []) {
    await assert.rejects(pool.query(sql, params), (error: unknown) =>
      ["23514", "23503", "23505"].includes((error as { code: string }).code),
    );
  }
  await rejects(
    `INSERT INTO "user" (id,name,email) VALUES ('c','Copy','ana@example.test')`,
  );
  await rejects(
    "INSERT INTO financial_accounts(user_id,name,initial_balance) VALUES ('a','Duplicate',0)",
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,category_id,category_type,occurred_on) VALUES ($1,'expense',1.5,'Fraction','hardware','expense','2026-01-10')",
    [accountA],
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,category_id,category_type,occurred_on) VALUES ($1,'expense',0,'Zero','hardware','expense','2026-01-10')",
    [accountA],
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,category_id,category_type,occurred_on) VALUES ($1,'income',100,'Wrong category','hardware','income','2026-01-10')",
    [accountA],
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,original_expense_id,occurred_on) VALUES ($1,'refund',1,'Other owner',$2,'2026-02-01')",
    [accountB, expense],
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,original_expense_id,occurred_on) VALUES ($1,'refund',1,'Too early',$2,'2026-01-09')",
    [accountA, expense],
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,original_expense_id,occurred_on) VALUES ($1,'refund',50000,'Too much',$2,'2026-02-01')",
    [accountA, expense],
  );
  await rejects(
    "UPDATE financial_accounts SET start_date='2026-02-01' WHERE id=$1",
    [accountA],
  );
  await rejects("UPDATE transactions SET amount=9000 WHERE id=$1", [expense]);
  const batch = randomUUID();
  await rejects(
    "UPDATE transactions SET deleted_at=now(),deletion_batch_id=$1 WHERE id=$2",
    [batch, expense],
  );
  await rejects(
    "UPDATE transactions SET occurred_on='2026-02-02' WHERE id=$1",
    [expense],
  );
  await rejects(
    "INSERT INTO transactions(account_id,type,amount,description,category_id,category_type,occurred_on) VALUES ($1,'income',100,'Future','salary','income',((now() AT TIME ZONE 'America/Santiago')::date + 1))",
    [accountA],
  );
  await pool.query(
    "UPDATE transactions SET deleted_at=now(), deletion_batch_id=$1 WHERE id=$2",
    [batch, refund],
  );
  await pool.query("UPDATE transactions SET amount=9000 WHERE id=$1", [
    expense,
  ]);
  await rejects(
    "UPDATE transactions SET deleted_at=NULL,deletion_batch_id=NULL WHERE id=$1",
    [refund],
  );
  await pool.query("UPDATE transactions SET amount=50000 WHERE id=$1", [
    expense,
  ]);
  await pool.query(
    "UPDATE transactions SET deleted_at=NULL,deletion_batch_id=NULL WHERE id=$1",
    [refund],
  );
  const earlierRefund = randomUUID();
  await pool.query(
    "INSERT INTO transactions(id,account_id,type,amount,description,original_expense_id,occurred_on,deleted_at,deletion_batch_id) VALUES ($1,$2,'refund',5000,'Previously deleted',$3,'2026-02-01',now(),$4)",
    [earlierRefund, accountA, expense, randomUUID()],
  );
  await pool.query(
    "UPDATE transactions SET deleted_at=now(),deletion_batch_id=$1 WHERE account_id=$2 AND deleted_at IS NULL",
    [batch, accountA],
  );
  assert.equal(await balance(), "100000");
  await pool.query(
    "UPDATE transactions SET deleted_at=NULL,deletion_batch_id=NULL WHERE deletion_batch_id=$1",
    [batch],
  );
  assert.equal(await balance(), "60000");
  assert.equal(
    (
      await pool.query(
        "SELECT deleted_at IS NOT NULL AS deleted FROM transactions WHERE id=$1",
        [earlierRefund],
      )
    ).rows[0].deleted,
    true,
  );

  // Two simultaneous refunds cannot both spend the remaining refund allowance.
  const results = await Promise.allSettled(
    [1, 2].map(() =>
      pool.query(
        "INSERT INTO transactions(account_id,type,amount,description,original_expense_id,occurred_on) VALUES ($1,'refund',30000,'Concurrent',$2,'2026-02-02')",
        [accountA, expense],
      ),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(results.filter((r) => r.status === "rejected").length, 1);
  console.log(
    "Schema tests passed: identity, ownership relationships, CLP, dates, refunds, trash and concurrency",
  );
} finally {
  await pool.end();
  await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`);
  await admin.end();
}
