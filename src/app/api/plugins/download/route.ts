import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Simulates a download: requires a valid matching license (or free plugin) and increments count.
// A license key is connected to EVERY plugin made by the same creator as the plugin it's linked
// to — redeeming one key unlocks that maker's whole catalog, not just a single plugin.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pluginId } = await req.json();
  const plugin = await prisma.plugin.findUnique({ where: { id: pluginId } });
  if (!plugin || plugin.status !== "Approved") {
    return NextResponse.json({ error: "Plugin not available." }, { status: 404 });
  }

  if (!plugin.isFree) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    // Match any license the user owns that is linked to a plugin from this SAME creator —
    // not just this exact plugin.
    const license = await prisma.license.findFirst({
      where: { userId: session.userId, plugin: { is: { creatorId: plugin.creatorId } } },
    });

    const expired = !!license?.expiration && new Date(license.expiration) < new Date();

    if (!license || expired || (license.hwid && license.hwid !== user?.hwid)) {
      return NextResponse.json(
        { error: "You need a valid, active license from this plugin's maker to download it." },
        { status: 403 }
      );
    }
  }

  await prisma.plugin.update({ where: { id: plugin.id }, data: { downloadCount: { increment: 1 } } });

  return NextResponse.json({ success: true, downloadUrl: `/placeholder-downloads/${plugin.name.replace(/\s+/g, "-").toLowerCase()}.jar` });
}
