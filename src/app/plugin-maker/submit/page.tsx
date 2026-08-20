"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SubmitPluginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", version: "1.0.0", price: "", isFree: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed.");
        return;
      }
      router.push("/plugin-maker");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:px-8">
      <Card>
        <CardTitle className="text-2xl">Submit a New Plugin</CardTitle>
        <CardDescription className="mb-6">Your plugin will be reviewed by an admin before it goes live.</CardDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Plugin Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white outline-none focus:border-cyan/60"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Version</Label>
            <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} required />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFree"
              checked={form.isFree}
              onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              className="h-4 w-4 rounded border-border bg-surface2 accent-cyan"
            />
            <Label htmlFor="isFree" className="mb-0">This plugin is free</Label>
          </div>
          {!form.isFree && (
            <div>
              <Label>Price (₱)</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Submitting..." : "Submit Plugin"}</Button>
        </form>
      </Card>
    </div>
  );
}
