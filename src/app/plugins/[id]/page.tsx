"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPeso, formatDate } from "@/lib/utils";
import { Download, Package } from "lucide-react";

type Plugin = {
  id: string;
  name: string;
  description: string;
  version: string;
  price: number;
  isFree: boolean;
  downloadCount: number;
  status: string;
  createdAt: string;
  creator?: { username: string };
};

export default function PluginDetailPage() {
  const params = useParams();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/plugins/${params.id}`)
      .then((r) => r.json())
      .then((d) => setPlugin(d.plugin))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDownload() {
    setMessage("");
    const res = await fetch("/api/plugins/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId: params.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Download failed.");
      return;
    }
    setMessage("Download started! (placeholder file)");
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-12">Loading...</div>;
  if (!plugin) return <div className="mx-auto max-w-4xl px-4 py-12">Plugin not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20">
              <Package className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <CardTitle className="text-2xl">{plugin.name}</CardTitle>
              <p className="text-sm text-gray-500">by {plugin.creator?.username || "Unknown"} · v{plugin.version}</p>
            </div>
          </div>
          <Badge tone={plugin.isFree ? "green" : "purple"} className="text-base">
            {plugin.isFree ? "Free" : formatPeso(plugin.price)}
          </Badge>
        </div>

        <CardDescription className="mb-6 text-base leading-relaxed">{plugin.description}</CardDescription>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-gray-400 sm:grid-cols-4">
          <div><p className="text-gray-500">Version</p><p className="text-white">{plugin.version}</p></div>
          <div><p className="text-gray-500">Downloads</p><p className="text-white">{plugin.downloadCount}</p></div>
          <div><p className="text-gray-500">Status</p><p className="text-white">{plugin.status}</p></div>
          <div><p className="text-gray-500">Published</p><p className="text-white">{formatDate(plugin.createdAt)}</p></div>
        </div>

        <Button onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
        {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
        {!plugin.isFree && (
          <p className="mt-3 text-xs text-gray-500">
            Requires a valid license key from this plugin&apos;s maker, matched to your HWID — one key unlocks every
            plugin that maker publishes. Redeem one from the Licenses page.
          </p>
        )}
      </Card>
    </div>
  );
}
