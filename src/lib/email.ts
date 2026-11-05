import nodemailer from "nodemailer";
import { prisma } from "./db";
const ok = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
// Every message is logged in Notification; if SMTP is missing the row records that, nothing pretends to be sent.
// SMS/WhatsApp: add a sender with another `channel` value and call it from the same places.
export async function sendEmail(to: string, subject: string, body: string) {
  const n = await prisma.notification.create({ data: { channel: "email", to, subject, body } });
  if (!ok()) { await prisma.notification.update({ where: { id: n.id }, data: { error: "SMTP not configured" } }); return }
  try {
    await nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
      .sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text: body });
    await prisma.notification.update({ where: { id: n.id }, data: { sentAt: new Date() } });
  } catch (e: any) { await prisma.notification.update({ where: { id: n.id }, data: { error: String(e.message).slice(0, 300) } }) }
}
export const orderLink = (o: { ref: string; accessToken: string }) => `${process.env.NEXTAUTH_URL}/order/${o.ref}?t=${o.accessToken}`;
export const sendOrderEmail = (o: { ref: string; accessToken: string; email: string; name: string }, headline: string) =>
  sendEmail(o.email, `${headline} – ${o.ref}`, `Hi ${o.name},\n\n${headline}.\nView and track your order: ${orderLink(o)}\n\nDouble J Tele World`);
