import { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
// NOTE: in-memory limiter is per server instance. Use Redis/Upstash when running several instances.
const hits = new Map<string, { n: number; t: number }>();
function limited(k: string) { const now = Date.now(), h = hits.get(k);
  if (!h || now - h.t > 15 * 60_000) { hits.set(k, { n: 1, t: now }); return false } h.n++; return h.n > 8 }
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 3600 },
  pages: { signIn: "/admin/login" },
  providers: [Credentials({ credentials: { email: {}, password: {} }, async authorize(c) {
    const email = String(c?.email || "").toLowerCase();
    if (limited(email)) return null;
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u || u.suspended || !(await bcrypt.compare(String(c?.password || ""), u.passwordHash))) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role } as any;
  } })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.role = (user as any).role; token.uid = user.id } return token },
    session({ session, token }) { (session.user as any).role = token.role; (session.user as any).id = token.uid; return session },
  },
};
export async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return s && (s.user as any).role === "ADMIN" ? (s.user as { id: string; email: string }) : null;
}
