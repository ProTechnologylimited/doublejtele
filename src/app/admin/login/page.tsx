"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
export default function Login() {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    const r = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    if (r?.ok) location.href = "/admin"; else { setErr("Invalid credentials, or too many attempts. Try again later."); setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-ink p-4">
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6">
      <h1 className="text-xl font-extrabold">DOUBLE J <span className="text-dgold">TELE WORLD</span> Admin</h1>
      <label className="block text-sm">Email<input name="email" type="email" required autoComplete="username" className="input mt-1" /></label>
      <label className="block text-sm">Password<input name="password" type="password" required autoComplete="current-password" className="input mt-1" /></label>
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form></main>;
}
