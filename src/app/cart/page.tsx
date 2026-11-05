"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCart, setCart, CartLine } from "@/lib/cart";
import { naira } from "@/lib/format";

type Q = {
  items?: {
    productId: string;
    nameSnapshot: string;
    unitPrice: number;
    qty: number;
  }[];
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  couponError?: string;
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  total?: number;
  zoneName?: string;
  etaMinDays?: number;
  etaMaxDays?: number;
  message?: string;
  error?: string;
};

export default function Cart() {
  const r = useRouter();

  const [lines, setLines] = useState<CartLine[]>([]);
  const [loc, setLoc] = useState({
    state: "",
    city: "",
    lga: ""
  });

  const [coupon, setCoupon] = useState("");
  const [q, setQ] = useState<Q | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLines(getCart());
  }, []);

  useEffect(() => {
    if (!lines.length) {
      setQ(null);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            lines,
            location: loc,
            coupon
          })
        });

        const data = await res.json();
        setQ(data);
      } catch {
        setQ({
          error: "Unable to calculate your order. Please try again."
        });
      }
    }, 300);

    return () => clearTimeout(t);
  }, [lines, loc, coupon]);

  const update = (l: CartLine[]) => {
    setCart(l);
    setLines(l);
  };

  async function place(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setErr("");

    const f = Object.fromEntries(
      new FormData(e.currentTarget)
    ) as Record<string, string>;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          lines,
          coupon,
          ...f
        })
      });

      const j = await res.json();

      if (res.ok) {
        setCart([]);
        r.push(`/order/${j.ref}?t=${j.token}`);
      } else {
        setErr(j.error || "Could not place order");
        setBusy(false);
      }
    } catch {
      setErr("Unable to place your order. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">Your cart</h1>

        {!lines.length ? (
          <p className="rounded-xl bg-white p-6 text-center text-mid">
            Your cart is empty.
          </p>
        ) : (
          <>
            {q?.error && (
              <p role="alert" className="rounded-xl bg-white p-4 text-red-700">
                {q.error}.{" "}
                <button
                  className="underline"
                  onClick={() => update([])}
                >
                  Clear cart
                </button>
              </p>
            )}

            <ul className="divide-y rounded-xl bg-white">
              {lines.map(l => {
                const it = q?.items?.find(
                  i => i.productId === l.productId
                );

                return (
                  <li
                    key={l.productId}
                    className="flex flex-wrap items-center justify-between gap-2 p-3"
                  >
                    <div>
                      <b>{it?.nameSnapshot ?? "…"}</b>

                      <div className="text-sm text-mid">
                        {it
                          ? naira(it.unitPrice) +
                            " each · " +
                            naira(it.unitPrice * l.qty)
                          : ""}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        aria-label="Decrease"
                        className="btn !min-w-[44px]"
                        onClick={() =>
                          update(
                            lines.flatMap(x =>
                              x.productId !== l.productId
                                ? [x]
                                : x.qty > 1
                                  ? [{ ...x, qty: x.qty - 1 }]
                                  : []
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span>{l.qty}</span>

                      <button
                        aria-label="Increase"
                        className="btn !min-w-[44px]"
                        onClick={() =>
                          update(
                            lines.map(x =>
                              x.productId === l.productId
                                ? { ...x, qty: x.qty + 1 }
                                : x
                            )
                          )
                        }
                      >
                        +
                      </button>

                      <button
                        className="btn-danger"
                        onClick={() =>
                          update(
                            lines.filter(
                              x => x.productId !== l.productId
                            )
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <form
              onSubmit={place}
              className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-2"
            >
              {(
                [
                  ["name", "Full name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["address", "Delivery address"]
                ] as const
              ).map(([n, label]) => (
                <label key={n} className="text-sm">
                  {label}
                  <input
                    name={n}
                    required
                    type={n === "email" ? "email" : "text"}
                    className="input mt-1"
                  />
                </label>
              ))}

              {(["state", "city", "lga"] as const).map(n => (
                <label key={n} className="text-sm">
                  {n === "lga"
                    ? "Local government area (optional)"
                    : n === "state"
                      ? "State"
                      : "City"}

                  <input
                    name={n}
                    required={n !== "lga"}
                    value={loc[n]}
                    onChange={e =>
                      setLoc({
                        ...loc,
                        [n]: e.target.value
                      })
                    }
                    className="input mt-1"
                  />
                </label>
              ))}

              <label className="text-sm md:col-span-2">
                Delivery instructions
                <input
                  name="notes"
                  className="input mt-1"
                />
              </label>

              <label className="text-sm md:col-span-2">
                Coupon code (optional)

                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="input mt-1"
                />

                {q?.couponError && (
                  <span className="text-red-700">
                    {q.couponError}
                  </span>
                )}
              </label>

              <div className="space-y-1 md:col-span-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <b>
                    {q?.subtotal != null
                      ? naira(q.subtotal)
                      : "—"}
                  </b>
                </div>

                {!!q?.discount && (
                  <div className="flex justify-between">
                    <span>Discount ({q.couponCode})</span>
                    <b>−{naira(q.discount)}</b>
                  </div>
                )}

                {q?.deliveryAvailable ? (
                  <>
                    <div className="flex justify-between">
                      <span>Delivery ({q.zoneName})</span>
                      <b>
                        {q.deliveryFee === 0
                          ? "Free"
                          : naira(q.deliveryFee!)}
                      </b>
                    </div>

                    <p className="text-sm text-mid">
                      Estimated delivery: {q.etaMinDays}–{q.etaMaxDays} days
                      after dispatch confirmation.
                    </p>

                    <div className="flex justify-between text-lg">
                      <span>Total</span>
                      <b className="text-dgold">
                        {naira(q.total!)}
                      </b>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-mid">
                    {q?.message ??
                      "Enter your state and city to see delivery."}
                  </p>
                )}
              </div>

              {err && (
                <p
                  role="alert"
                  className="text-sm text-red-700 md:col-span-2"
                >
                  {err}
                </p>
              )}

              <button
                className="btn md:col-span-2"
                disabled={
                  busy ||
                  !q?.deliveryAvailable ||
                  !!q?.couponError
                }
              >
                {busy
                  ? "Placing order…"
                  : "Place order (payment next)"}
              </button>

              <p className="text-xs text-mid md:col-span-2">
                Online payment is not connected yet (Stage 4).
                This creates an unpaid order with status Pending Payment.
              </p>
            </form>
          </>
        )}
      </main>
    </>
  );
}