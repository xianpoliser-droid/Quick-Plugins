import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET: public list of approved plugins (with search). Admin/creator sees own regardless of status via ?mine=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const mine = searchParams.get("mine") === "true";
  const all = searchParams.get("all") === "true";

  if (mine) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const plugins = await prisma.plugin.findMany({
      where: { creatorId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ plugins });
  }

  if (all) {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const plugins = await prisma.plugin.findMany({
      include: { creator: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ plugins });
  }

  const plugins = await prisma.plugin.findMany({
    where: {
      status: "Approved",
      OR: q ? [{ name: { contains: q } }, { description: { contains: q } }] : undefined,
    },
    include: { creator: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ plugins });
}

// POST: Plugin Maker submits a new plugin (status Pending)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["PluginMaker", "Admin"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, version, price, isFree } = body;
  if (!name || !description || !version) {
    return NextResponse.json({ error: "Name, description, and version are required." }, { status: 400 });
  }

  const plugin = await prisma.plugin.create({
    data: {
      name,
      description,
      version,
      price: isFree ? 0 : Number(price) || 0,
      isFree: !!isFree,
      creatorId: session.userId,
      status: session.role === "Admin" ? "Approved" : "Pending",
    },
  });

  return NextResponse.json({ plugin });
}
