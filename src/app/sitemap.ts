import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000", ps = await prisma.product.findMany({ where: { active: true }, select: { slug: true, createdAt: true } });
  return [{ url: base }, { url: base + "/shop" }, ...["returns", "refunds", "warranty", "privacy", "terms"].map(k => ({ url: `${base}/policies/${k}` })), ...ps.map(p => ({ url: `${base}/products/${p.slug}`, lastModified: p.createdAt }))];
}
