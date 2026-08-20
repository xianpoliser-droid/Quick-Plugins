import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: "Username must be 3+ chars and password 6+ chars." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken." }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const user = await prisma.user.create({
      data: { username, password: hashed, role: "User", lastIp: ip },
    });

    const token = await createSessionToken({ userId: user.id, username: user.username, role: user.role });

    const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
