"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { KeyRound } from "lucide-react";

type License = {
  id: string;
  name: string;
  key: string;
  expiration: string | null;
  minecraftIp: string;
  oneTimeUse: boolean;
  used: boolean;
  hwid: string | null;
  plugin?: { name: string; creator?: { username: string } } | null;
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("");
  const [hwid, setHwid] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  async function loadLicenses() {
    setLoading(true);
    try {
      const res = await fetch("/api/licenses");
      const data = await res.json();
      setLicenses(data.licenses || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLicenses();
  }, []);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setRedeeming(true);
    try {
      const res = await fetch("/api/licenses/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, hwid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Redemption failed." });
        return;
      }
      setMessage({ type: "success", text: "License redeemed successfully!" });
      setKey("");
      await loadLicenses();
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">My Licenses</h1>
      <p className="mt-2 text-gray-400">
        Licenses are locked to a specific HWID and Minecraft server IP, and each key unlocks every plugin made by
        the maker it's linked to. A license is hidden entirely if your HWID doesn't match.
      </p>

      <Card className="mt-8">
        <CardTitle className="mb-4 flex items-center gap-2"><KeyRound className="h-5 w-5 text-cyan" /> Redeem a License Key</CardTitle>
        <form onSubmit={handleRedeem} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          <div className="sm:col-span-2">
            <Label htmlFor="key">License Key</Label>
            <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="QP-XXXXXXXXXXXXXXXX" required />
          </div>
          <div>
            <Label htmlFor="hwid">Your HWID</Label>
            <Input id="hwid" value={hwid} onChange={(e) => setHwid(e.target.value)} placeholder="e.g. HWID-1234" required />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={redeeming}>{redeeming ? "Redeeming..." : "Redeem License"}</Button>
          </div>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-400" : "text-emerald-400"}`}>{message.text}</p>
        )}
      </Card>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Your Active Licenses</h2>
        {loading ? (
          <p className="text-gray-400">Loading licenses...</p>
        ) : licenses.length === 0 ? (
          <Card><CardDescription>No visible licenses. Redeem a key above, or check that your HWID matches.</CardDescription></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {licenses.map((l) => (
              <Card key={l.id}>
                <div className="mb-2 flex items-center justify-between">
                  <CardTitle>{l.name}</CardTitle>
                  <Badge tone={l.used ? "gray" : "green"}>{l.used ? "Activated" : "Unused"}</Badge>
                </div>
                <p className="mb-1 font-mono text-xs text-cyan">{l.key}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-400">
                  <p>
                    Unlocks:{" "}
                    {l.plugin?.creator?.username ? (
                      <span className="text-purple">All plugins by {l.plugin.creator.username}</span>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p>Minecraft IP: {l.minecraftIp}</p>
                  <p>Expiration: {l.expiration ? formatDate(l.expiration) : "Never"}</p>
                  <p>One-time use: {l.oneTimeUse ? "Yes" : "No"}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
