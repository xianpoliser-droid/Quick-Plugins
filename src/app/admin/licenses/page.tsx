"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type LicenseRow = {
  id: string;
  name: string;
  key: string;
  expiration: string | null;
  minecraftIp: string;
  oneTimeUse: boolean;
  used: boolean;
  hwid: string | null;
  user?: { username: string } | null;
  plugin?: { name: string; creator?: { username: string } } | null;
};

type PluginOption = {
  id: string;
  name: string;
  creator?: { username: string };
};

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [plugins, setPlugins] = useState<PluginOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    key: "",
    expiration: "",
    minecraftIp: "",
    oneTimeUse: false,
    pluginId: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [licRes, pluginRes] = await Promise.all([fetch("/api/licenses"), fetch("/api/plugins?all=true")]);
    const licData = await licRes.json();
    const pluginData = await pluginRes.json();
    setLicenses(licData.licenses || []);
    setPlugins(pluginData.plugins || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create license.");
        return;
      }
      setForm({ name: "", key: "", expiration: "", minecraftIp: "", oneTimeUse: false, pluginId: "" });
      load();
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/licenses/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = licenses.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.key.toLowerCase().includes(s) ||
      l.name.toLowerCase().includes(s) ||
      l.minecraftIp.toLowerCase().includes(s) ||
      (l.hwid || "").toLowerCase().includes(s) ||
      (l.user?.username || "").toLowerCase().includes(s) ||
      (l.plugin?.creator?.username || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">License Management</h1>

      <Card className="mt-6">
        <CardTitle className="mb-4">Add License Key</CardTitle>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>License Key Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Generated Key (optional — auto-generated if blank)</Label>
            <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="QP-XXXXXXXX" />
          </div>
          <div>
            <Label>Expiration Date (Optional)</Label>
            <Input type="date" value={form.expiration} onChange={(e) => setForm({ ...form, expiration: e.target.value })} />
          </div>
          <div>
            <Label>Specific Minecraft IP</Label>
            <Input value={form.minecraftIp} onChange={(e) => setForm({ ...form, minecraftIp: e.target.value })} required placeholder="play.example.com" />
          </div>
          <div className="sm:col-span-2">
            <Label>Plugin Maker&apos;s Catalog</Label>
            <Select value={form.pluginId} onChange={(e) => setForm({ ...form, pluginId: e.target.value })} required>
              <option value="">Select a plugin...</option>
              {plugins.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.creator?.username ? ` — by ${p.creator.username}` : ""}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-gray-500">
              This key is connected to <span className="text-cyan">every plugin made by this plugin&apos;s maker</span>,
              not just the one you pick here — choose any one of their plugins to link the whole catalog.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.oneTimeUse}
              onChange={(e) => setForm({ ...form, oneTimeUse: e.target.checked })}
              className="h-4 w-4 rounded border-border bg-surface2 accent-cyan"
              id="oneTime"
            />
            <Label htmlFor="oneTime" className="mb-0">ONE TIME USE?</Label>
          </div>
          <div className="sm:col-span-2">
            {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create License Key"}</Button>
          </div>
        </form>
      </Card>

      <div className="mt-8">
        <Input placeholder="Search by key, name, IP, HWID, user, or maker..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-border">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Key</th>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Unlocks (Maker)</th>
              <th className="py-2 pr-4">HWID</th>
              <th className="py-2 pr-4">MC IP</th>
              <th className="py-2 pr-4">One-Time</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-6 text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-6 text-gray-400">No licenses found.</td></tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/50">
                  <td className="py-2 pr-4">{l.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-cyan">{l.key}</td>
                  <td className="py-2 pr-4">{l.user?.username || "—"}</td>
                  <td className="py-2 pr-4">
                    {l.plugin?.creator?.username ? (
                      <span>All plugins by <span className="text-purple">{l.plugin.creator.username}</span></span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-400">{l.hwid || "—"}</td>
                  <td className="py-2 pr-4 text-xs">{l.minecraftIp}</td>
                  <td className="py-2 pr-4">{l.oneTimeUse ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4"><Badge tone={l.used ? "gray" : "green"}>{l.used ? "Used" : "Active"}</Badge></td>
                  <td className="py-2 pr-4"><Button size="sm" variant="danger" onClick={() => revoke(l.id)}>Revoke</Button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
