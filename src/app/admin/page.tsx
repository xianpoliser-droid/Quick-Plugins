import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPeso } from "@/lib/utils";
import { Users, KeyRound, Package, Server, TrendingUp, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [userCount, licenseCount, pluginCount, serverCount, plugins] = await Promise.all([
    prisma.user.count(),
    prisma.license.count(),
    prisma.plugin.count(),
    prisma.server.count(),
    prisma.plugin.findMany(),
  ]);

  const revenue = plugins.reduce((sum, p) => sum + (p.isFree ? 0 : p.price * p.downloadCount), 0);

  const sections = [
    { href: "/admin/users", title: "User Management", desc: "View, ban, and manage user roles.", icon: Users, stat: userCount },
    { href: "/admin/licenses", title: "License Management", desc: "Create, edit, and revoke license keys.", icon: KeyRound, stat: licenseCount },
    { href: "/admin/plugins", title: "Plugin Management", desc: "Approve, reject, and edit plugin listings.", icon: Package, stat: pluginCount },
    { href: "/admin/servers", title: "Server Management", desc: "Add, edit, and remove server listings.", icon: Server, stat: serverCount },
    { href: "/admin/sales", title: "Sales & Analytics", desc: "Revenue, downloads, and platform stats.", icon: TrendingUp, stat: formatPeso(revenue) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Everything — Admin Dashboard</h1>
      <p className="mt-2 text-gray-400">Full control over QUICK PLUGINS.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full cursor-pointer">
              <s.icon className="mb-3 h-6 w-6 text-cyan" />
              <CardTitle>{s.title}</CardTitle>
              <CardDescription className="mt-1">{s.desc}</CardDescription>
              <p className="mt-4 text-2xl font-bold">{s.stat}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
