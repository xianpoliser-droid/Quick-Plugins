import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const server = await prisma.server.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ server });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await prisma.server.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
