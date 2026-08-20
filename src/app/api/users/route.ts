import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const users = await prisma.user.findMany({
    where: q ? { username: { contains: q } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { licenses: true, plugins: true } } },
  });
  const safe = users.map(({ password, ...u }) => u);
  return NextResponse.json({ users: safe });
}
