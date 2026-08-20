import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const plugin = await prisma.plugin.findUnique({
    where: { id: params.id },
    include: { creator: { select: { username: true } } },
  });
  if (!plugin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ plugin });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plugin = await prisma.plugin.findUnique({ where: { id: params.id } });
  if (!plugin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = plugin.creatorId === session.userId;
  if (!isOwner && session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.version !== undefined) data.version = body.version;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.isFree !== undefined) data.isFree = body.isFree;
  // Only Admin can change approval status
  if (body.status !== undefined && session.role === "Admin") data.status = body.status;

  const updated = await prisma.plugin.update({ where: { id: params.id }, data });
  return NextResponse.json({ plugin: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plugin = await prisma.plugin.findUnique({ where: { id: params.id } });
  if (!plugin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = plugin.creatorId === session.userId;
  if (!isOwner && session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.plugin.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
