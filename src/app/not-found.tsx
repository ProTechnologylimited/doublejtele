import Link from "next/link";
export default function NotFound() {
  return <main className="grid min-h-[60vh] place-items-center p-6 text-center"><div><h1 className="text-3xl font-extrabold">Page not found</h1><p className="my-3 text-mid">The page you’re looking for doesn’t exist or has moved.</p><Link href="/shop" className="btn inline-block">Continue shopping</Link></div></main>;
}
