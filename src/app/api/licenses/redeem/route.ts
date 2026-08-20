import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, hwid } = await req.json();
  if (!key || !hwid) {
    return NextResponse.json({ error: "License key and HWID are required." }, { status: 400 });
  }

  const license = await prisma.license.findUnique({ where: { key } });
  if (!license) {
    return NextResponse.json({ error: "Invalid license key." }, { status: 404 });
  }

  if (license.userId && license.userId !== session.userId) {
    return NextResponse.json({ error: "This license key is already claimed." }, { status: 409 });
  }

  if (license.oneTimeUse && license.used) {
    return NextResponse.json({ error: "This one-time-use license has already been redeemed." }, { status: 409 });
  }

  if (license.expiration && new Date(license.expiration) < new Date()) {
    return NextResponse.json({ error: "This license key has expired." }, { status: 410 });
  }

  // Lock the license to this user's HWID on first redemption
  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      userId: session.userId,
      hwid: license.hwid || hwid,
      used: true,
    },
  });

  // Persist HWID on the user account too
  await prisma.user.update({ where: { id: session.userId }, data: { hwid } });

  return NextResponse.json({ success: true, license: updated });
}
