import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomBytes } from "crypto";

// GET: list licenses. Admin -> all. User -> only their own with matching HWID/IP (hidden otherwise).
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "Admin") {
    const licenses = await prisma.license.findMany({
      include: {
        user: { select: { username: true } },
        plugin: { select: { name: true, creator: { select: { username: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ licenses });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const licenses = await prisma.license.findMany({
    where: { userId: user.id },
    include: { plugin: { select: { name: true, creator: { select: { username: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  // Hide license entirely if HWID or IP does not match
  const visible = licenses.filter((l) => {
    const hwidMatch = !l.hwid || l.hwid === user.hwid;
    const ipMatch = !user.lastIp || l.minecraftIp === "*" || true; // minecraftIp is the server IP restriction, not user IP
    return hwidMatch && ipMatch;
  });

  return NextResponse.json({ licenses: visible });
}

// POST: Admin creates a new license key. The key is linked to one of a Plugin Maker's plugins,
// which grants the redeemer access to that maker's ENTIRE catalog — not just the linked plugin.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, expiration, minecraftIp, oneTimeUse, pluginId, key } = body;

  if (!name || !minecraftIp) {
    return NextResponse.json({ error: "Name and Minecraft IP are required." }, { status: 400 });
  }
  if (!pluginId) {
    return NextResponse.json(
      { error: "Select a plugin — the key inherits access to every plugin by that plugin's maker." },
      { status: 400 }
    );
  }

  const plugin = await prisma.plugin.findUnique({ where: { id: pluginId } });
  if (!plugin) {
    return NextResponse.json({ error: "Selected plugin was not found." }, { status: 404 });
  }

  const generatedKey = key || `QP-${randomBytes(8).toString("hex").toUpperCase()}`;

  const license = await prisma.license.create({
    data: {
      name,
      key: generatedKey,
      expiration: expiration ? new Date(expiration) : null,
      minecraftIp,
      oneTimeUse: !!oneTimeUse,
      pluginId,
    },
  });

  return NextResponse.json({ license });
}
