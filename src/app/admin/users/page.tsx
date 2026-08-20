"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type UserRow = {
  id: string;
  username: string;
  role: string;
  isBanned: boolean;
  hwid: string | null;
  lastIp: string | null;
  _count: { licenses: number; plugins: number };
};

const ROLES = ["User", "PluginMaker", "Developer", "Admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateUser(id: string, body: any) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">User Management</h1>
      <div className="mt-6 flex gap-2">
        <Input placeholder="Search username..." value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="secondary" onClick={load}>Search</Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-border">
              <th className="py-2 pr-4">Username</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">HWID</th>
              <th className="py-2 pr-4">Last IP</th>
              <th className="py-2 pr-4">Licenses</th>
              <th className="py-2 pr-4">Plugins</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-6 text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="py-6 text-gray-400">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-2 pr-4">{u.username}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="rounded-md border border-border bg-surface2 px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-400">{u.hwid || "—"}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-400">{u.lastIp || "—"}</td>
                  <td className="py-2 pr-4">{u._count.licenses}</td>
                  <td className="py-2 pr-4">{u._count.plugins}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={u.isBanned ? "red" : "green"}>{u.isBanned ? "Banned" : "Active"}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant={u.isBanned ? "secondary" : "danger"} onClick={() => updateUser(u.id, { isBanned: !u.isBanned })}>
                        {u.isBanned ? "Unban" : "Ban"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateUser(u.id, { resetHwid: true })}>Reset HWID</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
