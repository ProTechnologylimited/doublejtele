export type CartLine = { productId: string; qty: number };
const K = "djtw-cart";
export function getCart(): CartLine[] { try { return JSON.parse(localStorage.getItem(K) || "[]") } catch { return [] } }
export function setCart(c: CartLine[]) { try { localStorage.setItem(K, JSON.stringify(c)) } catch {} window.dispatchEvent(new Event("cart")) }
export function addToCart(productId: string, qty: number) {
  const c = getCart(), l = c.find(x => x.productId === productId);
  if (l) l.qty += qty; else c.push({ productId, qty }); setCart(c);
}
