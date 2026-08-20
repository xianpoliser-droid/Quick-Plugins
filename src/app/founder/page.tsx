import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FounderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <Badge tone="purple" className="mb-4">Founder — Owner</Badge>
      <h1 className="text-4xl font-bold">Meet the Founder</h1>
      <Card className="mt-8">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-purple text-xl font-bold text-black">
            QP
          </div>
          <div>
            <CardTitle>Alex "Quick" Rivera</CardTitle>
            <p className="text-sm text-gray-500">Founder & Owner, QUICK PLUGINS</p>
          </div>
        </div>
        <CardDescription className="text-base leading-relaxed">
          QUICK PLUGINS started as a small hobby project to help Minecraft server owners find reliable,
          affordable plugins without the hassle of shady marketplaces. Today it's grown into a trusted
          freemium platform focused on security, fair pricing in Philippine Pesos, and a great developer
          experience for plugin makers everywhere.
        </CardDescription>
        <CardDescription className="mt-4 text-base leading-relaxed">
          Our mission is simple: keep plugins accessible, keep licenses secure, and keep the community
          thriving — one server at a time.
        </CardDescription>
      </Card>
    </div>
  );
}
