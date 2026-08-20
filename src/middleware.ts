import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "qp_session";
const secretKey = process.env.JWT_SECRET || "dev-secret-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

// path -> roles allowed (Admin always allowed implicitly)
const protectedRoutes: { prefix: string; roles: string[] }[] = [
  { prefix: "/licenses", roles: ["User", "PluginMaker", "Developer"] },
  { prefix: "/my-plugins", roles: ["User", "PluginMaker", "Developer"] },
  { prefix: "/profile", roles: ["User", "PluginMaker", "Developer"] },
  { prefix: "/plugin-maker", roles: ["PluginMaker"] },
  { prefix: "/developer", roles: ["Developer"] },
  { prefix: "/admin", roles: [] }, // Admin only
];

async function getSession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as { userId: string; username: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = protectedRoutes.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSession(token);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = session.role === "Admin";
  const allowed = isAdmin || match.roles.includes(session.role);

  if (!allowed) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/licenses/:path*",
    "/my-plugins/:path*",
    "/profile/:path*",
    "/plugin-maker/:path*",
    "/developer/:path*",
    "/admin/:path*",
  ],
};
