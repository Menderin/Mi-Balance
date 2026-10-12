import nodemailer from "nodemailer";
import type { ResetMail } from "./auth.ts";

export function createResetMailer() {
  const host = process.env.SMTP_HOST;
  const transport = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 1025),
        secure: process.env.SMTP_SECURE === "true",
        ...(process.env.SMTP_USER
          ? {
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              },
            }
          : {}),
        connectionTimeout: 5000,
        socketTimeout: 10000,
      })
    : undefined;
  return async ({ email, url }: ResetMail) => {
    if (!transport) throw new Error("SMTP is not configured");
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? "Mi Balance <no-reply@mi-balance.test>",
      to: email,
      subject: "Recupera tu contraseña de Mi Balance",
      text: `Para establecer una contraseña nueva, abre este enlace:\n\n${url}\n\nVence en 30 minutos y se puede usar una sola vez. Si no lo solicitaste, ignora este correo.`,
    });
  };
}
