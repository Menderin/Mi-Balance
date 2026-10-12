import { betterAuth } from "better-auth";
import type pg from "pg";

export type ResetMail = { email: string; url: string };

export function createAuth(
  pool: pg.Pool,
  origin: string,
  secret: string,
  sendResetMail: (mail: ResetMail) => Promise<void>,
  rateLimitEnabled = true,
) {
  if (secret.length < 32)
    throw new Error("AUTH_SECRET requires at least 32 characters");
  return betterAuth({
    database: pool,
    baseURL: origin,
    secret,
    trustedOrigins: [origin],
    logger: { disabled: true },
    rateLimit: { enabled: rateLimitEnabled },
    advanced: { ipAddress: { ipAddressHeaders: ["x-real-ip"] } },
    session: {
      expiresIn: 7 * 24 * 60 * 60,
      disableSessionRefresh: true,
      cookieCache: { enabled: false },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 30 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url, token }) => {
        await pool.query(
          `DELETE FROM verification WHERE value = $1 AND identifier LIKE 'reset-password:%' AND identifier <> $2`,
          [user.id, `reset-password:${token}`],
        );
        await sendResetMail({ email: user.email, url });
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
