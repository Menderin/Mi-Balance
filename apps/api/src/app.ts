import Fastify from "fastify";

export function buildApp(
  checkDatabase: () => Promise<unknown>,
  logger = false,
) {
  const app = Fastify({ logger });
  app.get("/api/health/live", async () => ({ status: "ok" }));
  app.get("/api/health/ready", async (_request, reply) => {
    try {
      await checkDatabase();
      return { status: "ok" };
    } catch {
      return reply.code(503).send({ status: "unavailable" });
    }
  });
  return app;
}
