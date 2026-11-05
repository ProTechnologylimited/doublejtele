"use client";
import { useRouter } from "next/navigation";
export default function DeleteButton({ url, what }: { url: string; what: string }) {
  const r = useRouter();
  return <button className="btn-danger" onClick={async () => {
    if (!confirm(`Delete ${what}? This cannot be undone.`)) return;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) r.refresh(); else alert((await res.json()).error ?? "Delete failed");
  }}>Delete</button>;
}
