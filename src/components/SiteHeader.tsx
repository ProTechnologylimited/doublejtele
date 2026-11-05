import Link from "next/link";
import CartLink from "./CartLink";
export default function SiteHeader() {
  return <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 bg-ink px-4 py-3 text-white">
    <Link href="/" className="font-extrabold">DOUBLE J <span className="text-gold">TELE WORLD</span></Link>
    <Link href="/shop" className="hover:text-gold">Shop</Link>
    <Link href="/track" className="hover:text-gold">Track order</Link>
    <form action="/shop" className="ml-auto min-w-[140px] flex-1 md:max-w-xs"><input name="q" placeholder="Search products…" aria-label="Search products" className="input" /></form>
    <CartLink /></header>;
}
