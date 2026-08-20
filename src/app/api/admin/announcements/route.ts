import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { title, message } = await req.json();
  if (!title || !message) return NextResponse.json({ error: "Title and message required." }, { status: 400 });
  const announcement = await prisma.announcement.create({ data: { title, message } });
  return NextResponse.json({ announcement });
}
