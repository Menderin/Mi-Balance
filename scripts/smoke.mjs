import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const engine = process.argv[2] ?? "docker";
assert.ok(["docker", "podman"].includes(engine), "Use docker or podman");
function compose(...args) {
  return execFileSync(engine, ["compose", ...args], {
    encoding: "utf8",
    timeout: 120000,
  });
}
function sql(query) {
  return compose(
    "exec",
    "-T",
    "db",
    "psql",
    "-U",
    "mi_balance",
    "-d",
    "mi_balance",
    "-v",
    "ON_ERROR_STOP=1",
    "-tAc",
    query,
  ).trim();
}
async function expectStatus(path, status) {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(`http://localhost:8080${path}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.status === status) return response;
    } catch {
      /* Services can be restarting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Expected ${status} at ${path}`);
}
assert.match(await (await expectStatus("/", 200)).text(), /Mi Balance/);
await expectStatus("/api/health/ready", 200);
compose(
  "run",
  "--rm",
  "api",
  "npm",
  "run",
  "migrate",
  "--workspace",
  "@mi-balance/api",
);
compose(
  "run",
  "--rm",
  "api",
  "npm",
  "run",
  "migrate",
  "--workspace",
  "@mi-balance/api",
);
sql(
  "INSERT INTO schema_migrations(name, checksum) VALUES ('__m0_probe', 'probe') ON CONFLICT DO NOTHING",
);
try {
  compose("up", "-d", "--force-recreate", "--wait", "db");
  assert.equal(
    sql("SELECT checksum FROM schema_migrations WHERE name = '__m0_probe'"),
    "probe",
  );
  compose("stop", "db");
  await expectStatus("/api/health/ready", 503);
  await expectStatus("/api/health/live", 200);
} finally {
  compose("up", "-d", "--wait", "db");
  sql("DELETE FROM schema_migrations WHERE name = '__m0_probe'");
}
await expectStatus("/api/health/ready", 200);
console.log(
  "Smoke passed: web, proxy, database, migrations, persistence and recovery.",
);
