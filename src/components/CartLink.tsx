"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
export default function CartLink() {
  const [n, setN] = useState(0);
  useEffect(() => { const u = () => setN(getCart().reduce((t, l) => t + l.qty, 0)); u(); window.addEventListener("cart", u); return () => window.removeEventListener("cart", u) }, []);
  return <Link href="/cart" className="btn !min-h-[40px]" aria-label={`Cart, ${n} items`}>Cart ({n})</Link>;
}
