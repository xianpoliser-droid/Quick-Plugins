"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPeso } from "@/lib/utils";

type Plugin = {
  id: string;
  name: string;
  description: string;
  version: string;
  price: number;
  isFree: boolean;
  downloadCount: number;
  status: string;
  creator?: { username: string };
};

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    // fetch all plugins regardless of status is not directly supported by public GET,
    // so combine approved + pending/rejected by fetching mine=true won't work for admin either.
    // Use a dedicated approach: fetch with no filter via query param include all.
    const res = await fetch("/api/plugins?all=true");
    const data = await res.json();
    setPlugins(data.plugins || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/plugins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Plugin Management</h1>
      <p className="mt-2 text-gray-400">Approve, reject, and manage all submitted plugins.</p>

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : plugins.length === 0 ? (
          <Card><CardDescription>No plugins submitted yet.</CardDescription></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plugins.map((p) => (
              <Card key={p.id}>
                <div className="mb-2 flex items-center justify-between">
                  <CardTitle>{p.name}</CardTitle>
                  <Badge tone={p.status === "Approved" ? "green" : p.status === "Pending" ? "yellow" : "red"}>{p.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                <div className="mt-2 text-xs text-gray-500">by {p.creator?.username || "Unknown"} · v{p.version} · {p.isFree ? "Free" : formatPeso(p.price)} · {p.downloadCount} downloads</div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => setStatus(p.id, "Approved")} disabled={p.status === "Approved"}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => setStatus(p.id, "Rejected")} disabled={p.status === "Rejected"}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
