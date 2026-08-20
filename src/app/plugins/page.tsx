"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPeso } from "@/lib/utils";
import { Search, Download } from "lucide-react";

type Plugin = {
  id: string;
  name: string;
  description: string;
  version: string;
  price: number;
  isFree: boolean;
  downloadCount: number;
  creator?: { username: string };
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/plugins?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setPlugins(d.plugins || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [q]);

  const filtered = plugins.filter((p) => {
    if (filter === "free") return p.isFree;
    if (filter === "paid") return !p.isFree;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugins</h1>
          <p className="mt-1 text-gray-400">Freemium Minecraft plugins — all prices in ₱.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "free", "paid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors ${
                filter === f ? "border-cyan text-cyan" : "border-border text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input className="pl-9" placeholder="Search plugins..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading plugins...</p>
      ) : filtered.length === 0 ? (
        <Card><CardDescription>No plugins found.</CardDescription></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/plugins/${p.id}`}>
              <Card className="h-full cursor-pointer">
                <div className="mb-2 flex items-center justify-between">
                  <CardTitle>{p.name}</CardTitle>
                  <Badge tone={p.isFree ? "green" : "purple"}>{p.isFree ? "Free" : formatPeso(p.price)}</Badge>
                </div>
                <CardDescription className="line-clamp-3">{p.description}</CardDescription>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>v{p.version} · by {p.creator?.username || "Unknown"}</span>
                  <span className="flex items-center gap-1"><Download className="h-3 w-3" />{p.downloadCount}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
