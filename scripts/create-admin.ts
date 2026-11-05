import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const p = new PrismaClient();
(async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase(), pw = process.env.ADMIN_PASSWORD;
  if (!email || !pw || pw.length < 12) { console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in .env"); process.exit(1); }
  const passwordHash = await bcrypt.hash(pw, 12);
  await p.user.upsert({ where: { email }, update: { role: "ADMIN", passwordHash }, create: { email, name: "Store Owner", passwordHash, role: "ADMIN" } });
  console.log("Admin ready:", email, "(remove ADMIN_PASSWORD from .env now)");
})();
