import { prisma } from "./db";
import { DEFAULTS, Settings } from "./settings-defaults";
export { DEFAULTS };
export type { Settings };
export async function getSettings(): Promise<Settings> {
  try { const r = await prisma.setting.findUnique({ where: { key: "store" } }); return { ...DEFAULTS, ...((r?.value as object) || {}) } } catch { return DEFAULTS }
}
