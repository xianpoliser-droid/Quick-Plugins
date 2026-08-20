import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const servers = await prisma.server.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ servers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const server = await prisma.server.create({
    data: {
      name: body.name,
      status: body.status || "Online",
      players: Number(body.players) || 0,
      maxPlayers: Number(body.maxPlayers) || 100,
      version: body.version,
      ip: body.ip,
    },
  });
  return NextResponse.json({ server });
}
