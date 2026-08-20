"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPeso } from "@/lib/utils";
import { Plus, TrendingUp } from "lucide-react";

type Plugin = {
  id: string;
  name: string;
  description: string;
  version: string;
  price: number;
  isFree: boolean;
  downloadCount: number;
  status: string;
};

export default function PluginMakerDashboard() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plugins?mine=true").then((r) => r.json()).then((d) => setPlugins(d.plugins || [])).finally(() => setLoading(false));
  }, []);

  const earnings = plugins.reduce((sum, p) => sum + (p.isFree ? 0 : p.price * p.downloadCount), 0);
  const totalDownloads = plugins.reduce((sum, p) => sum + p.downloadCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plugin Maker Dashboard</h1>
          <p className="mt-1 text-gray-400">Manage your plugins and track your earnings.</p>
        </div>
        <Link href="/plugin-maker/submit"><Button><Plus className="h-4 w-4" /> Submit Plugin</Button></Link>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-400">Total Plugins</p>
          <p className="mt-1 text-2xl font-bold">{plugins.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Total Downloads</p>
          <p className="mt-1 text-2xl font-bold">{totalDownloads}</p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-sm text-gray-400"><TrendingUp className="h-4 w-4 text-cyan" /> Estimated Earnings</p>
          <p className="mt-1 text-2xl font-bold text-cyan">{formatPeso(earnings)}</p>
        </Card>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Your Plugins</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : plugins.length === 0 ? (
        <Card><CardDescription>You haven't submitted any plugins yet.</CardDescription></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plugins.map((p) => (
            <Card key={p.id}>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                <Badge tone={p.status === "Approved" ? "green" : p.status === "Pending" ? "yellow" : "red"}>{p.status}</Badge>
              </div>
              <CardDescription className="line-clamp-2">{p.description}</CardDescription>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>v{p.version} · {p.isFree ? "Free" : formatPeso(p.price)}</span>
                <span>{p.downloadCount} downloads</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
