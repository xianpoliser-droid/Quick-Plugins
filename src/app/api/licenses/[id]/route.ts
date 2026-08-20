import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const license = await prisma.license.update({
    where: { id: params.id },
    data: {
      name: body.name,
      expiration: body.expiration ? new Date(body.expiration) : null,
      minecraftIp: body.minecraftIp,
      oneTimeUse: body.oneTimeUse,
      hwid: body.hwid,
      used: body.used,
    },
  });
  return NextResponse.json({ license });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await prisma.license.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
