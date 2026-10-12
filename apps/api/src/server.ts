import { buildApp } from "./app.ts";
import { createPool } from "./database.ts";

const pool = createPool();
const app = buildApp(() => pool.query("SELECT 1"), true);
app.addHook("onClose", async () => {
  await pool.end();
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close();
  });
}
await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
