import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "./app.ts";

test("liveness does not require the database", async () => {
  const app = buildApp(async () => {
    throw new Error("secret database URL");
  });
  try {
    assert.equal((await app.inject("/api/health/live")).statusCode, 200);
  } finally {
    await app.close();
  }
});
test("readiness succeeds when the database responds", async () => {
  const app = buildApp(async () => undefined);
  try {
    const response = await app.inject("/api/health/ready");
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ok" });
  } finally {
    await app.close();
  }
});
test("readiness returns 503 without exposing database errors", async () => {
  const app = buildApp(async () => {
    throw new Error("secret database URL");
  });
  try {
    const response = await app.inject("/api/health/ready");
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json(), { status: "unavailable" });
  } finally {
    await app.close();
  }
});
