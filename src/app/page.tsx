import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPeso } from "@/lib/utils";
import { Rocket, ShieldCheck, Server as ServerIcon, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [pluginCount, licenseCount, userCount, featuredPlugins, featuredServers] = await Promise.all([
    prisma.plugin.count({ where: { status: "Approved" } }).catch(() => 0),
    prisma.license.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.plugin.findMany({ where: { status: "Approved" }, take: 3, orderBy: { downloadCount: "desc" } }).catch(() => []),
    prisma.server.findMany({ take: 3 }).catch(() => []),
  ]);

  const stats = [
    { label: "Approved Plugins", value: pluginCount, icon: Sparkles },
    { label: "Licenses Issued", value: licenseCount, icon: ShieldCheck },
    { label: "Registered Users", value: userCount, icon: Rocket },
  ];

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-24 text-center lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge tone="cyan" className="mb-6">Freemium Plugin Marketplace</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            QUICK <span className="text-gradient">PLUGINS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Discover free and paid Minecraft plugins, redeem secure HWID-locked license keys, and
            browse live servers — all in one clean, freemium marketplace.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/plugins"><Button size="lg">Browse Plugins</Button></Link>
            <Link href="/register"><Button size="lg" variant="outline">Create Free Account</Button></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 h-6 w-6 text-cyan" />
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Plugins</h2>
          <Link href="/plugins" className="text-sm text-cyan hover:underline">View all →</Link>
        </div>
        {featuredPlugins.length === 0 ? (
          <Card><CardDescription>No approved plugins yet. Check back soon!</CardDescription></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlugins.map((p) => (
              <Card key={p.id}>
                <div className="mb-2 flex items-center justify-between">
                  <CardTitle>{p.name}</CardTitle>
                  <Badge tone={p.isFree ? "green" : "purple"}>{p.isFree ? "Free" : formatPeso(p.price)}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>v{p.version}</span>
                  <span>{p.downloadCount} downloads</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Servers</h2>
          <Link href="/servers" className="text-sm text-cyan hover:underline">View all →</Link>
        </div>
        {featuredServers.length === 0 ? (
          <Card><CardDescription>No servers listed yet.</CardDescription></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServers.map((s) => (
              <Card key={s.id}>
                <div className="mb-2 flex items-center gap-2">
                  <ServerIcon className="h-4 w-4 text-purple-glow" />
                  <CardTitle>{s.name}</CardTitle>
                </div>
                <p className="text-sm text-gray-400">{s.players}/{s.maxPlayers} players · v{s.version}</p>
                <p className="mt-2 font-mono text-xs text-cyan">{s.ip}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
