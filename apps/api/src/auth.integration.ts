import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import pg from "pg";
import { createAuth, type ResetMail } from "./auth.ts";
import { registerAuthRoutes } from "./auth-routes.ts";
import { buildApp } from "./app.ts";
import { createResetMailer } from "./mail.ts";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "db");
assert.equal(url.pathname, "/mi_balance");
const database = `mi_balance_auth_test_${randomUUID().replaceAll("-", "")}`;
const admin = new pg.Pool({ connectionString: url.toString() });
await admin.query(`CREATE DATABASE "${database}"`);
url.pathname = `/${database}`;
const pool = new pg.Pool({ connectionString: url.toString() });
const app = buildApp(() => pool.query("SELECT 1"));
const mails: ResetMail[] = [];
const origin = "http://localhost:8080";
try {
  const directory = new URL("../migrations/", import.meta.url);
  for (const name of (await readdir(directory))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await pool.query(await readFile(new URL(name, directory), "utf8"));
  }
  const auth = createAuth(
    pool,
    origin,
    "local-auth-test-secret-at-least-32-characters",
    async (mail) => {
      mails.push(mail);
      if (process.env.AUTH_TEST_SMTP === "true")
        await createResetMailer()(mail);
    },
    false, // Test many flows immediately; the application keeps rate limiting enabled.
  );
  registerAuthRoutes(app, auth, pool, origin);
  const post = (
    path: string,
    payload: object,
    cookie?: string,
    requestOrigin = origin,
  ) =>
    app.inject({
      method: "POST",
      url: `/api/auth/${path}`,
      payload,
      headers: { origin: requestOrigin, ...(cookie ? { cookie } : {}) },
    });
  const password = "Only-a-test-password-123";
  const email = "ana@example.test";
  const result = await auth.api.signUpEmail({
    body: { email, name: "Ana", password },
  });
  assert.equal(
    (
      await post("sign-up/email", {
        email: "other@example.test",
        name: "Other",
        password,
      })
    ).statusCode,
    404,
  );
  assert.equal((await app.inject("/api/me")).statusCode, 401);
  assert.equal(
    (await post("sign-in/email", { email, password })).statusCode,
    403,
    "Unverified mail cannot log in",
  );
  await pool.query(`UPDATE "user" SET "emailVerified" = true WHERE id = $1`, [
    result.user.id,
  ]);
  assert.equal(
    (await post("sign-in/email", { email, password: "wrong-password" }))
      .statusCode,
    401,
  );
  assert.equal(
    (
      await post(
        "sign-in/email",
        { email, password },
        undefined,
        "https://evil.example",
      )
    ).statusCode,
    403,
  );
  async function login(pass = password) {
    const response = await post("sign-in/email", {
      email: " Ana@Example.Test ",
      password: pass,
      rememberMe: true,
    });
    assert.equal(response.statusCode, 200);
    const cookies = response.headers["set-cookie"];
    assert.ok(cookies);
    const list = Array.isArray(cookies) ? cookies : [cookies];
    assert.ok(list.some((cookie) => cookie.includes("HttpOnly")));
    return list.map((cookie) => cookie.split(";")[0]).join("; ");
  }
  const cookie = await login();
  const secondCookie = await login();
  const me = await app.inject({ url: "/api/me", headers: { cookie } });
  assert.equal(me.statusCode, 200);
  assert.equal(me.json().user.email, email);
  assert.deepEqual(Object.keys(me.json().user).sort(), ["email", "id", "name"]);
  const expiry = await pool.query(
    `SELECT extract(epoch FROM ("expiresAt" - "createdAt"))::float8 AS lifetime FROM session LIMIT 1`,
  );
  // Creation timestamps may differ by milliseconds; compare total duration.
  assert.ok(expiry.rows[0].lifetime <= 7 * 24 * 60 * 60);
  assert.ok(expiry.rows[0].lifetime >= 7 * 24 * 60 * 60 - 5);
  await pool.query(
    `UPDATE session SET "createdAt" = now() - interval '3 days', "expiresAt" = now() + interval '4 days'`,
  );
  const beforeRefresh = (
    await pool.query(`SELECT "expiresAt" FROM session ORDER BY id`)
  ).rows;
  await app.inject({ url: "/api/me", headers: { cookie } });
  assert.deepEqual(
    (await pool.query(`SELECT "expiresAt" FROM session ORDER BY id`)).rows,
    beforeRefresh,
    "Reading session cannot extend its lifetime",
  );
  const reset = (mailbox = email) =>
    post("request-password-reset", {
      email: mailbox,
      redirectTo: `${origin}/recuperar`,
    });
  assert.equal((await reset("unknown@example.test")).statusCode, 200);
  assert.equal(mails.length, 0);
  await reset();
  const oldToken = new URL(mails[0].url).pathname.split("/").at(-1)!;
  await reset();
  const newToken = new URL(mails[1].url).pathname.split("/").at(-1)!;
  const newPassword = "New-test-password-456";
  assert.equal(
    (await post("reset-password", { token: oldToken, newPassword })).statusCode,
    400,
  );
  const callback = await app.inject({
    url: new URL(mails[1].url).pathname + new URL(mails[1].url).search,
  });
  assert.equal(callback.statusCode, 302);
  assert.equal(
    new URL(String(callback.headers.location)).pathname,
    "/recuperar",
  );
  assert.equal(
    (await post("reset-password", { token: newToken, newPassword })).statusCode,
    200,
  );
  assert.equal(
    (await post("reset-password", { token: newToken, newPassword })).statusCode,
    400,
  );
  for (const previousCookie of [cookie, secondCookie])
    assert.equal(
      (
        await app.inject({
          url: "/api/me",
          headers: { cookie: previousCookie },
        })
      ).statusCode,
      401,
    );
  const freshCookie = await login(newPassword);
  assert.equal((await post("sign-out", {}, freshCookie)).statusCode, 200);
  assert.equal(
    (await app.inject({ url: "/api/me", headers: { cookie: freshCookie } }))
      .statusCode,
    401,
  );
  await reset();
  const expiredToken = new URL(mails.at(-1)!.url).pathname.split("/").at(-1)!;
  const tokenLifetime = await pool.query(
    `SELECT extract(epoch FROM ("expiresAt" - "createdAt"))::float8 AS lifetime FROM verification WHERE identifier = $1`,
    [`reset-password:${expiredToken}`],
  );
  assert.ok(tokenLifetime.rows[0].lifetime <= 30 * 60);
  assert.ok(tokenLifetime.rows[0].lifetime >= 30 * 60 - 5);
  await pool.query(
    `UPDATE verification SET "expiresAt" = now() - interval '1 minute' WHERE identifier = $1`,
    [`reset-password:${expiredToken}`],
  );
  assert.equal(
    (await post("reset-password", { token: expiredToken, newPassword }))
      .statusCode,
    400,
  );
  await Promise.all([reset(), reset()]);
  assert.equal(
    (
      await pool.query(
        `SELECT count(*)::int AS count FROM verification WHERE value = $1 AND identifier LIKE 'reset-password:%'`,
        [result.user.id],
      )
    ).rows[0].count,
    1,
  );
  const limitingApp = buildApp(() => pool.query("SELECT 1"));
  registerAuthRoutes(
    limitingApp,
    createAuth(
      pool,
      origin,
      "local-rate-limit-test-secret-at-least-32-characters",
      async () => {},
    ),
    pool,
    origin,
  );
  try {
    const statuses = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      statuses.push(
        (
          await limitingApp.inject({
            method: "POST",
            url: "/api/auth/sign-in/email",
            headers: { origin, "x-real-ip": "192.0.2.42" },
            payload: { email, password: "wrong-password" },
          })
        ).statusCode,
      );
    }
    assert.ok(
      statuses.includes(429),
      "Application limits repeated login attempts",
    );
  } finally {
    await limitingApp.close();
  }
  console.log(
    "Auth integration passed: login, cookies, origin, session, recovery, expiration and revocation.",
  );
} finally {
  await app.close();
  await pool.end();
  await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`);
  await admin.end();
}
