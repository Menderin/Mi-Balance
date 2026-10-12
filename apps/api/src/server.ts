import { buildApp } from "./app.ts";
import { createPool } from "./database.ts";
import { createAuth, type Auth } from "./auth.ts";
import { registerAuthRoutes } from "./auth-routes.ts";
import { createResetMailer } from "./mail.ts";

const pool = createPool();
const app = buildApp(() => pool.query("SELECT 1"), true);
const origin = process.env.APP_ORIGIN ?? "http://localhost:8080";
const secret = process.env.AUTH_SECRET ?? "";
if (secret.length < 32)
  throw new Error("AUTH_SECRET requires at least 32 characters");
let auth: Auth | undefined;
registerAuthRoutes(
  app,
  async () => {
    if (auth) return auth;
    const result = await pool.query(
      `SELECT to_regclass('public."user"') IS NOT NULL AND to_regclass('public.session') IS NOT NULL AND to_regclass('public.account') IS NOT NULL AND to_regclass('public.verification') IS NOT NULL AS ready`,
    );
    if (!result.rows[0].ready)
      throw Object.assign(
        new Error(
          "Autenticación no disponible. Aplica las migraciones locales.",
        ),
        { statusCode: 503 },
      );
    return (auth ??= createAuth(pool, origin, secret, createResetMailer()));
  },
  pool,
  origin,
);
app.addHook("onClose", async () => {
  await pool.end();
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close();
  });
}
await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
