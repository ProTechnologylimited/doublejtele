import "./globals.css";
import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings(), base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return { metadataBase: new URL(base), title: { default: s.storeName, template: `%s | ${s.storeName}` }, description: s.description || "Phones, laptops and electronics.",
    openGraph: { siteName: s.storeName, type: "website" } };
}
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-soft text-ink">{children}<SiteFooter /></body></html>;
}
