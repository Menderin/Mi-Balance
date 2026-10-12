import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { createPool } from "./database.ts";
import { createAuth } from "./auth.ts";

// No user creation against remote databases, and no password in shell arguments.
const url = new URL(process.env.DATABASE_URL ?? "");
if (
  url.hostname !== "db" ||
  url.pathname !== "/mi_balance" ||
  !process.stdin.isTTY
) {
  throw new Error("Run interactively inside local Compose only");
}
let hidden = false;
const output = new Writable({
  write(chunk, _encoding, callback) {
    if (!hidden) process.stdout.write(chunk);
    callback();
  },
});
const input = createInterface({ input: process.stdin, output, terminal: true });
const pool = createPool();
try {
  const name = (await input.question("Nombre: ")).trim();
  const email = (await input.question("Correo: ")).trim().toLowerCase();
  process.stdout.write("Contraseña (8–128 caracteres, no se muestra): ");
  hidden = true;
  const password = await input.question("");
  hidden = false;
  process.stdout.write("\n");
  const auth = createAuth(
    pool,
    process.env.APP_ORIGIN ?? "http://localhost:8080",
    process.env.AUTH_SECRET ?? "",
    async () => {},
  );
  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });
  await pool.query(`UPDATE "user" SET "emailVerified" = true WHERE id = $1`, [
    result.user.id,
  ]);
  console.log("Usuario local creado. Ya puedes iniciar sesión.");
} catch {
  hidden = false;
  process.stdout.write(
    "\nNo se pudo crear el usuario. Revisa los datos o si el correo ya existe.\n",
  );
  process.exitCode = 1;
} finally {
  input.close();
  await pool.end();
}
