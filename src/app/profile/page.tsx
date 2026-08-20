"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Me = { userId: string; username: string; role: string };
type UserDetail = {
  id: string;
  username: string;
  role: string;
  hwid: string | null;
  lastIp: string | null;
  createdAt: string;
  licenses: any[];
  plugins: any[];
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(async (d) => {
      if (!d.user) return;
      setMe(d.user);
      const res = await fetch(`/api/users/${d.user.userId}`);
      const data = await res.json();
      setDetail(data.user);
      setUsername(data.user?.username || "");
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${me.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username !== detail?.username ? username : undefined,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed.");
        return;
      }
      setMessage("Profile updated successfully.");
      setDetail(data.user);
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setSaving(false);
    }
  }

  if (!detail) return <div className="mx-auto max-w-3xl px-4 py-12 text-gray-400">Loading profile...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card className="mt-8">
        <CardTitle className="mb-1">Account Overview</CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><p className="text-gray-500">Role</p><Badge tone="purple">{detail.role}</Badge></div>
          <div><p className="text-gray-500">HWID</p><p className="font-mono text-xs text-cyan">{detail.hwid || "Not set"}</p></div>
          <div><p className="text-gray-500">Last IP</p><p className="font-mono text-xs text-cyan">{detail.lastIp || "Unknown"}</p></div>
          <div><p className="text-gray-500">Joined</p><p>{formatDate(detail.createdAt)}</p></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Licenses</p><p className="text-xl font-bold">{detail.licenses?.length ?? 0}</p></div>
          <div><p className="text-gray-500">Plugins Submitted</p><p className="text-xl font-bold">{detail.plugins?.length ?? 0}</p></div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardTitle className="mb-4">Edit Account</CardTitle>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to change password" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </form>
      </Card>
    </div>
  );
}
