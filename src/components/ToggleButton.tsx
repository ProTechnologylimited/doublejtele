"use client";
import { useRouter } from "next/navigation";
export default function ToggleButton({ url, active }: { url: string; active: boolean }) {
  const r = useRouter();
  return <button className="btn !min-h-[36px]" onClick={async () => { const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active: !active }) }); if (res.ok) r.refresh() }}>{active ? "Disable" : "Enable"}</button>;
}
