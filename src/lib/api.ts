import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { requireAdmin } from "./auth";
import { prisma } from "./db";
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export async function uniqueSlug(model: "product" | "category", name: string) {
  const base = slugify(name) || "item";
  const taken = await (prisma[model] as any).findUnique({ where: { slug: base } });
  return taken ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base;
}
export async function audit(actorId: string, action: string, target?: string) { await prisma.auditLog.create({ data: { actorId, action, target } }) }
// Every admin API handler runs through this: server-side role check + safe errors.
export async function guard(fn: (admin: { id: string }) => Promise<Response>) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return await fn(admin);
  } catch (e: any) {
    if (e instanceof ZodError) return NextResponse.json({ error: "Please fix the highlighted fields", issues: e.flatten().fieldErrors }, { status: 400 });
    if (e?.code === "P2002") return NextResponse.json({ error: "That name, slug or SKU is already in use" }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80), description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")), sort: z.number().int().default(0),
  active: z.boolean().default(true), parentId: z.string().nullish(),
});
export const productSchema = z.object({
  name: z.string().trim().min(2).max(160), description: z.string().trim().min(10).max(5000),
  price: z.number().int().min(1), comparePrice: z.number().int().positive().nullish(),
  stock: z.number().int().min(0), categoryId: z.string().min(1),
  brand: z.string().max(80).optional(), model: z.string().max(80).optional(),
  sku: z.string().max(60).optional().or(z.literal("")).transform(v => v || undefined),
  warranty: z.string().max(300).optional(), featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false), active: z.boolean().default(true),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().max(160).optional() })).max(10).default([]),
}).refine(v => !v.comparePrice || v.comparePrice > v.price, { message: "Previous price must be higher than the current price", path: ["comparePrice"] });
