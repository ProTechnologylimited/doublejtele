import { withAuth } from "next-auth/middleware";
export default withAuth({ callbacks: { authorized: ({ token }) => token?.role === "ADMIN" }, pages: { signIn: "/admin/login" } });
export const config = { matcher: ["/admin", "/admin/((?!login).*)", "/api/admin/:path*"] };
