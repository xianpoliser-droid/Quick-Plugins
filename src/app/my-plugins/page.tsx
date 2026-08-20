"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPeso } from "@/lib/utils";
import { Download } from "lucide-react";

type License = {
  id: string;
  expiration: string | null;
  plugin?: { creator?: { username: string } | null } | null;
};

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

export default function MyPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [unlockedMakers, setUnlockedMakers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/licenses").then((r) => r.json()), fetch("/api/plugins").then((r) => r.json())])
      .then(([licenseData, pluginData]) => {
        const licenses: License[] = licenseData.licenses || [];
        const now = new Date();
        // A license unlocks its maker's ENTIRE catalog. Collect every maker covered by a
        // license that hasn't expired — HWID/IP matching is already enforced server-side,
        // since /api/licenses only ever returns licenses visible to this account.
        const makers = new Set(
          licenses
            .filter((l) => !l.expiration || new Date(l.expiration) > now)
            .map((l) => l.plugin?.creator?.username)
            .filter((u): u is string => !!u)
        );
        setUnlockedMakers(makers);
        setPlugins(pluginData.plugins || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const owned = plugins.filter((p) => !p.isFree && p.creator?.username && unlockedMakers.has(p.creator.username));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">My Plugins</h1>
      <p className="mt-2 text-gray-400">
        Every plugin unlocked by your active licenses — redeeming one key unlocks its maker&apos;s entire catalog,
        not just one plugin.
      </p>

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : owned.length === 0 ? (
          <Card>
            <CardDescription>
              You don&apos;t own any plugins yet. Browse the{" "}
              <Link href="/plugins" className="text-cyan hover:underline">
                Plugins
              </Link>{" "}
              page or redeem a license key to get started.
            </CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {owned.map((p) => (
              <Link key={p.id} href={`/plugins/${p.id}`}>
                <Card className="h-full cursor-pointer">
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle>{p.name}</CardTitle>
                    <Badge tone="green">Owned</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      v{p.version} · {formatPeso(p.price)} · by {p.creator?.username || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {p.downloadCount}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
