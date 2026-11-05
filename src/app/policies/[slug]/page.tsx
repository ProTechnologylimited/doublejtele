import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getSettings, Settings } from "@/lib/settings";
export const dynamic = "force-dynamic";
const P: Record<string, [keyof Settings, string]> = { returns: ["returnPolicy", "Return policy"], refunds: ["refundPolicy", "Refund policy"], warranty: ["warrantyPolicy", "Warranty policy"], privacy: ["privacyPolicy", "Privacy policy"], terms: ["terms", "Terms and conditions"] };
export default async function Policy({ params }: { params: { slug: string } }) {
  const e = P[params.slug]; if (!e) notFound(); const s = await getSettings();
  return <><SiteHeader /><main className="mx-auto max-w-2xl p-4"><h1 className="mb-3 text-2xl font-bold">{e[1]}</h1>
    <p className="whitespace-pre-line rounded-xl bg-white p-4">{s[e[0]] || "This policy has not been published yet."}</p></main></>;
}
