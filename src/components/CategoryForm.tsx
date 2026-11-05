"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function CategoryForm({ cats, initial, id }: { cats: { id: string; name: string }[]; initial?: any; id?: string }) {
  const r = useRouter(); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget, f = new FormData(form);
    const res = await fetch(id ? `/api/admin/categories/${id}` : "/api/admin/categories", { method: id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      name: f.get("name"), description: f.get("description") || undefined, sort: Number(f.get("sort") || 0), active: f.get("active") === "on", parentId: f.get("parentId") || null }) });
    const j = await res.json();
    if (res.ok) { setMsg({ ok: true, t: "Category saved." }); if (!id) form.reset(); r.refresh(); } else setMsg({ ok: false, t: j.error + (j.issues ? " " + JSON.stringify(j.issues) : "") });
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-2">
    <label className="text-sm">Name<input name="name" defaultValue={initial?.name} required className="input mt-1" /></label>
    <label className="text-sm">Parent (optional)<select name="parentId" defaultValue={initial?.parentId ?? ""} className="input mt-1"><option value="">None (top level)</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className="text-sm md:col-span-2">Description<input name="description" defaultValue={initial?.description} className="input mt-1" /></label>
    <label className="text-sm">Display order<input name="sort" type="number" defaultValue={initial?.sort ?? 0} className="input mt-1" /></label>
    <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={initial ? initial.active : true} /> Active</label>
    <button className="btn md:col-span-2">{id ? "Save category" : "Add category"}</button>
    {msg && <p role="status" className={`md:col-span-2 text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.t}</p>}
  </form>;
}
