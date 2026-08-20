import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code2, Terminal } from "lucide-react";

const docs = [
  { icon: Terminal, title: "Getting Started", body: "Learn how license keys, HWID locking, and plugin downloads work together on QUICK PLUGINS." },
  { icon: Code2, title: "License Validation API", body: "Reference for validating license keys, HWID, and IP restrictions from your plugin's server-side code." },
  { icon: BookOpen, title: "Best Practices", body: "Guidelines for building secure, performant Minecraft plugins that play nicely with our licensing system." },
];

export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
      <Badge tone="cyan" className="mb-4">Developer</Badge>
      <h1 className="text-4xl font-bold">Developer Documentation</h1>
      <p className="mt-2 text-gray-400">Resources for building and integrating with the QUICK PLUGINS ecosystem.</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {docs.map((d) => (
          <Card key={d.title}>
            <d.icon className="mb-3 h-6 w-6 text-cyan" />
            <CardTitle className="mb-2">{d.title}</CardTitle>
            <CardDescription>{d.body}</CardDescription>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardTitle className="mb-3">Example: Validating a License Key</CardTitle>
        <pre className="overflow-x-auto rounded-lg bg-surface2 p-4 text-sm text-cyan">
{`POST /api/licenses/redeem
{
  "key": "QP-XXXXXXXXXXXXXXXX",
  "hwid": "HWID-1234"
}`}
        </pre>
        <CardDescription className="mt-3">
          A license is only valid for one HWID and one Minecraft server IP. Any mismatch hides the license entirely from that account.
        </CardDescription>
      </Card>
    </div>
  );
}
