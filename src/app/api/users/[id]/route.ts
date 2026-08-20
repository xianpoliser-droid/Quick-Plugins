import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.userId !== params.id && session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { licenses: true, plugins: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password, ...safe } = user;
  return NextResponse.json({ user: safe });
}

// Self-service profile update, or Admin management (role, ban, hwid reset)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSelf = session.userId === params.id;
  if (!isSelf && session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};

  if (isSelf) {
    if (body.username) data.username = body.username;
    if (body.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: params.id } });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const valid = await verifyPassword(body.currentPassword || "", user.password);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      data.password = await hashPassword(body.newPassword);
    }
  }

  if (session.role === "Admin") {
    if (body.role) data.role = body.role;
    if (body.isBanned !== undefined) data.isBanned = body.isBanned;
    if (body.resetHwid) data.hwid = null;
  }

  try {
    const updated = await prisma.user.update({ where: { id: params.id }, data });
    const { password, ...safe } = updated;
    return NextResponse.json({ user: safe });
  } catch {
    return NextResponse.json({ error: "Username may already be taken." }, { status: 409 });
  }
}
