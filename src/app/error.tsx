"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="grid min-h-[60vh] place-items-center p-6 text-center"><div><h1 className="text-2xl font-extrabold">Something went wrong</h1><p className="my-3 text-mid">Please try again. If it keeps happening, contact the store.</p><button className="btn" onClick={reset}>Try again</button></div></main>;
}
