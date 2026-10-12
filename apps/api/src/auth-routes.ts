import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import pg from "pg";
import type { Auth } from "./auth.ts";

export function registerAuthRoutes(
  app: FastifyInstance,
  authSource: Auth | (() => Promise<Auth>),
  pool: pg.Pool,
  origin: string,
) {
  const getAuth =
    typeof authSource === "function" ? authSource : async () => authSource;
  // Separate lock connection: waiting resets must not exhaust the auth query pool.
  const resetLocks = new pg.Pool({
    connectionString: pool.options.connectionString,
    max: 1,
    connectionTimeoutMillis: 15000,
  });
  app.addHook("onClose", async () => {
    await resetLocks.end();
  });
  app.get("/api/me", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const session = await (
      await getAuth()
    ).api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session)
      return reply.code(401).send({ message: "Inicia sesión para continuar." });
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    };
  });
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    // Recovery links contain tokens: never log request URLs for these routes.
    logLevel: "silent",
    handler: async (request, reply) => {
      const path = new URL(request.url, origin).pathname;
      const allowed =
        request.method === "POST"
          ? [
              "/api/auth/sign-in/email",
              "/api/auth/sign-out",
              "/api/auth/request-password-reset",
              "/api/auth/reset-password",
            ].includes(path)
          : /^\/api\/auth\/reset-password\/[^/]+$/.test(path);
      if (!allowed)
        return reply.code(404).send({ message: "Ruta no disponible." });
      const auth = await getAuth();
      const body = request.body as { email?: unknown } | undefined;
      if (typeof body?.email === "string")
        body.email = body.email.trim().toLowerCase();
      const forward = async () => {
        const response = await auth.handler(
          new Request(new URL(request.url, origin), {
            method: request.method,
            headers: fromNodeHeaders(request.headers),
            ...(request.method === "POST"
              ? { body: JSON.stringify(request.body ?? {}) }
              : {}),
          }),
        );
        reply.code(response.status).header("cache-control", "no-store");
        response.headers.forEach((value, key) => {
          if (key !== "set-cookie") reply.header(key, value);
        });
        const cookies = response.headers.getSetCookie();
        if (cookies.length) reply.header("set-cookie", cookies);
        return reply.send(await response.text());
      };
      if (
        path !== "/api/auth/request-password-reset" ||
        typeof body?.email !== "string"
      )
        return forward();
      // Serialize recovery requests per mailbox, including across API replicas.
      const client = await resetLocks.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
          [`password-reset:${body.email}`],
        );
        const result = await forward();
        await client.query("COMMIT");
        return result;
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
    },
  });
}
