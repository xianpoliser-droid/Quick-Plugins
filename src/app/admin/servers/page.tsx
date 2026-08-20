"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Server = {
  id: string;
  name: string;
  status: string;
  players: number;
  maxPlayers: number;
  version: string;
  ip: string;
};

export default function AdminServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", status: "Online", players: "0", maxPlayers: "100", version: "", ip: "" });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/servers");
    const data = await res.json();
    setServers(data.servers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", status: "Online", players: "0", maxPlayers: "100", version: "", ip: "" });
      load();
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/servers/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleStatus(s: Server) {
    await fetch(`/api/servers/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s.status === "Online" ? "Offline" : "Online" }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Server Management</h1>

      <Card className="mt-6">
        <CardTitle className="mb-4">Add Server</CardTitle>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>IP</Label><Input value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} required /></div>
          <div><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} required /></div>
          <div><Label>Players</Label><Input type="number" value={form.players} onChange={(e) => setForm({ ...form, players: e.target.value })} /></div>
          <div><Label>Max Players</Label><Input type="number" value={form.maxPlayers} onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })} /></div>
          <div className="flex items-end"><Button type="submit" disabled={creating} className="w-full">{creating ? "Adding..." : "Add Server"}</Button></div>
        </form>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? <p className="text-gray-400">Loading...</p> : servers.map((s) => (
          <Card key={s.id}>
            <div className="mb-2 flex items-center justify-between">
              <CardTitle>{s.name}</CardTitle>
              <Badge tone={s.status === "Online" ? "green" : "red"}>{s.status}</Badge>
            </div>
            <p className="text-sm text-gray-400">{s.players}/{s.maxPlayers} · v{s.version}</p>
            <p className="mt-1 font-mono text-xs text-cyan">{s.ip}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => toggleStatus(s)}>Toggle Status</Button>
              <Button size="sm" variant="danger" onClick={() => remove(s.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
