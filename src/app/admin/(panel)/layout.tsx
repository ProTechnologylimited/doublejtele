import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
export default async function Panel({ children }: { children: React.ReactNode }) {
  if (!(await requireAdmin())) redirect("/admin/login"); // second, server-side check beyond middleware
  return <div className="min-h-screen">
    <nav className="print:hidden flex flex-wrap items-center gap-4 bg-ink px-4 py-3 text-white">
      <b>DOUBLE J <span className="text-gold">TELE WORLD</span></b>
      <Link href="/admin" className="hover:text-gold">Dashboard</Link>
      <Link href="/admin/orders" className="hover:text-gold">Orders</Link>
      <Link href="/admin/products" className="hover:text-gold">Products</Link>
      <Link href="/admin/categories" className="hover:text-gold">Categories</Link>
      <Link href="/admin/coupons" className="hover:text-gold">Coupons</Link>
      <Link href="/admin/settings" className="hover:text-gold">Settings</Link>
      <Link href="/admin/delivery" className="hover:text-gold">Delivery</Link>
      <a href="/api/auth/signout" className="ml-auto text-gold">Sign out</a>
    </nav><div className="mx-auto max-w-5xl p-4">{children}</div></div>;
}
