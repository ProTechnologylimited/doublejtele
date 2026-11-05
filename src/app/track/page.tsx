"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function Track() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setMsg("");

    const f = Object.fromEntries(
      new FormData(e.currentTarget)
    );

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(f)
      });

      const data = await res.json();

      setMsg(
        data.message ||
        data.error ||
        "Your request has been processed."
      );
    } catch {
      setMsg("Unable to process your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-md p-4">
        <h1 className="mb-3 text-2xl font-bold">
          Track your order
        </h1>

        <form
          onSubmit={submit}
          className="space-y-3 rounded-xl bg-white p-4"
        >
          <label className="block text-sm">
            Order reference

            <input
              name="ref"
              required
              className="input mt-1"
              placeholder="DJ-XXXXXXXXXX"
            />
          </label>

          <label className="block text-sm">
            Email used at checkout

            <input
              name="email"
              type="email"
              required
              className="input mt-1"
            />
          </label>

          <button
            className="btn w-full"
            disabled={busy}
          >
            {busy
              ? "Processing..."
              : "Email me my tracking link"}
          </button>

          {msg && (
            <p role="status" className="text-sm">
              {msg}
            </p>
          )}
        </form>
      </main>
    </>
  );
}