import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { guard, audit } from "@/lib/api";
import { DEFAULTS, getSettings } from "@/lib/settings";
const schema = z.object(Object.fromEntries(Object.keys(DEFAULTS).map(k => [k, z.string().max(20000).optional()]))).strict();
export const PUT = (req: Request) => guard(async a => {
  const d = schema.parse(await req.json()), value = { ...(await getSettings()), ...d };
  await prisma.setting.upsert({ where: { key: "store" }, update: { value }, create: { key: "store", value } });
  await audit(a.id, "settings.update"); return NextResponse.json({ ok: true });
});
