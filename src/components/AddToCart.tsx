"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
export default function AddToCart({ id, stock }: { id: string; stock: number }) {
  const r = useRouter(); const [q, setQ] = useState(1); const [added, setAdded] = useState(false);
  if (stock < 1) return <p className="font-bold text-red-700">Out of stock</p>;
  return <div className="flex flex-wrap items-center gap-2">
    <label className="text-sm">Qty <input type="number" min={1} max={stock} value={q} onChange={e => setQ(Math.max(1, Math.min(stock, Number(e.target.value) || 1)))} className="input !w-20" /></label>
    <button className="btn" onClick={() => { addToCart(id, q); setAdded(true) }}>Add to Cart</button>
    <button className="btn !bg-ink !text-gold" onClick={() => { addToCart(id, q); r.push("/cart") }}>Buy Now</button>
    {added && <span role="status" className="text-sm text-green-700">Added to cart</span>}</div>;
}
