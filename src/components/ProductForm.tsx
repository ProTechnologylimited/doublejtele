"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ProductForm({ cats, initial, id }: { cats: { id: string; name: string }[]; initial?: any; id?: string }) {
  const r = useRouter(); const [imgs, setImgs] = useState<string[]>(initial?.images ?? []); const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function upload(files: FileList | null) {
    if (!files) return; setBusy(true); setMsg(null);
    try { for (const f of Array.from(files)) {
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contentType: f.type, size: f.size }) });
      const j = await res.json(); if (!res.ok) throw new Error(j.error);
      const put = await fetch(j.uploadUrl, { method: "PUT", headers: { "content-type": f.type }, body: f });
      if (!put.ok) throw new Error("Image upload failed");
      setImgs(i => [...i, j.publicUrl]); } }
    catch (e: any) { setMsg({ ok: false, t: e.message }) }
    setBusy(false);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget, f = new FormData(form), kobo = (v: FormDataEntryValue | null) => v ? Math.round(Number(v) * 100) : null;
    const res = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", { method: id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      name: f.get("name"), description: f.get("description"), price: kobo(f.get("price")), comparePrice: kobo(f.get("comparePrice")),
      stock: Number(f.get("stock")), categoryId: f.get("categoryId"), brand: f.get("brand") || undefined, model: f.get("model") || undefined,
      sku: f.get("sku") || undefined, warranty: f.get("warranty") || undefined, featured: f.get("featured") === "on",
      bestSeller: f.get("bestSeller") === "on", active: f.get("active") === "on", images: imgs.map(url => ({ url, alt: String(f.get("name")) })) }) });
    const j = await res.json();
    if (res.ok) { setMsg({ ok: true, t: "Product saved and live on the storefront." }); if (!id) { form.reset(); setImgs([]) } r.refresh(); }
    else setMsg({ ok: false, t: j.error + (j.issues ? " " + JSON.stringify(j.issues) : "") });
  }
  const L = "text-sm";
  return <form onSubmit={submit} className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-2">
    <label className={L}>Name<input name="name" defaultValue={initial?.name} required className="input mt-1" /></label>
    <label className={L}>Category<select name="categoryId" defaultValue={initial?.categoryId} required className="input mt-1"><option value="">Select…</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className={`${L} md:col-span-2`}>Description<textarea name="description" defaultValue={initial?.description} required minLength={10} rows={3} className="input mt-1" /></label>
    <label className={L}>Price (₦)<input name="price" defaultValue={initial?.price} type="number" min="1" step="0.01" required className="input mt-1" /></label>
    <label className={L}>Previous price (₦, optional)<input name="comparePrice" defaultValue={initial?.comparePrice} type="number" step="0.01" className="input mt-1" /></label>
    <label className={L}>Stock<input name="stock" defaultValue={initial?.stock} type="number" min="0" required className="input mt-1" /></label>
    <label className={L}>SKU<input name="sku" defaultValue={initial?.sku} className="input mt-1" /></label>
    <label className={L}>Brand<input name="brand" defaultValue={initial?.brand} className="input mt-1" /></label>
    <label className={L}>Model<input name="model" defaultValue={initial?.model} className="input mt-1" /></label>
    <label className={`${L} md:col-span-2`}>Warranty<input name="warranty" defaultValue={initial?.warranty} className="input mt-1" /></label>
    <div className="md:col-span-2"><label className={L}>Images (JPG/PNG/WebP, max 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => upload(e.target.files)} className="input mt-1" /></label>
      <div className="mt-2 flex flex-wrap gap-2">{imgs.map(u => <div key={u} className="relative"><img src={u} alt="Preview" className="h-20 w-20 rounded object-cover" />
        <button type="button" aria-label="Remove image" onClick={() => setImgs(i => i.filter(x => x !== u))} className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-ink text-white">×</button></div>)}</div></div>
    <div className="flex flex-wrap gap-4 md:col-span-2 text-sm">
      <label><input name="featured" type="checkbox" defaultChecked={initial?.featured} /> Featured</label><label><input name="bestSeller" type="checkbox" defaultChecked={initial?.bestSeller} /> Best seller</label><label><input name="active" type="checkbox" defaultChecked={initial ? initial.active : true} /> Visible in store</label></div>
    <button className="btn md:col-span-2" disabled={busy}>{busy ? "Uploading…" : "Save product"}</button>
    {msg && <p role="status" className={`md:col-span-2 text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.t}</p>}
  </form>;
}
