"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Server as ServerIcon, Check } from "lucide-react";

type Server = {
  id: string;
  name: string;
  status: string;
  players: number;
  maxPlayers: number;
  version: string;
  ip: string;
};

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/servers").then((r) => r.json()).then((d) => setServers(d.servers || [])).finally(() => setLoading(false));
  }, []);

  function copyIp(ip: string) {
    navigator.clipboard.writeText(ip);
    setCopied(ip);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Servers</h1>
      <p className="mt-2 text-gray-400">Browse live Minecraft servers powered by QUICK PLUGINS.</p>

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-400">Loading servers...</p>
        ) : servers.length === 0 ? (
          <Card>No servers listed yet.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servers.map((s) => (
              <Card key={s.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-4 w-4 text-purple-glow" />
                    <CardTitle>{s.name}</CardTitle>
                  </div>
                  <Badge tone={s.status === "Online" ? "green" : "red"}>{s.status}</Badge>
                </div>
                <p className="text-sm text-gray-400">{s.players}/{s.maxPlayers} players · v{s.version}</p>
                <div className="mt-4 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-surface2 px-3 py-2 text-xs text-cyan">{s.ip}</code>
                  <Button size="sm" variant="secondary" onClick={() => copyIp(s.ip)}>
                    {copied === s.ip ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <Button className="mt-3 w-full" variant="outline" size="sm">Join Server</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
