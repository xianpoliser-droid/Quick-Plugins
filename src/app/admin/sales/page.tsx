import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPeso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSalesPage() {
  const [plugins, userCount, licenseCount, announcements] = await Promise.all([
    prisma.plugin.findMany({ include: { creator: { select: { username: true } } } }),
    prisma.user.count(),
    prisma.license.count(),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalRevenue = plugins.reduce((sum, p) => sum + (p.isFree ? 0 : p.price * p.downloadCount), 0);
  const totalDownloads = plugins.reduce((sum, p) => sum + p.downloadCount, 0);
  const salesByPlugin = plugins
    .filter((p) => !p.isFree)
    .map((p) => ({ name: p.name, revenue: p.price * p.downloadCount, downloads: p.downloadCount }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Sales & Analytics</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card><p className="text-sm text-gray-400">Total Revenue</p><p className="mt-1 text-2xl font-bold text-cyan">{formatPeso(totalRevenue)}</p></Card>
        <Card><p className="text-sm text-gray-400">Total Users</p><p className="mt-1 text-2xl font-bold">{userCount}</p></Card>
        <Card><p className="text-sm text-gray-400">Total Licenses</p><p className="mt-1 text-2xl font-bold">{licenseCount}</p></Card>
        <Card><p className="text-sm text-gray-400">Total Downloads</p><p className="mt-1 text-2xl font-bold">{totalDownloads}</p></Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Sales by Plugin</h2>
        <Card>
          {salesByPlugin.length === 0 ? (
            <CardDescription>No paid sales yet.</CardDescription>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr><th className="py-2">Plugin</th><th className="py-2">Downloads</th><th className="py-2">Revenue</th></tr>
              </thead>
              <tbody>
                {salesByPlugin.map((s) => (
                  <tr key={s.name} className="border-t border-border/50">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">{s.downloads}</td>
                    <td className="py-2 text-cyan">{formatPeso(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Recent Announcements</h2>
        <Card>
          {announcements.length === 0 ? (
            <CardDescription>No announcements posted.</CardDescription>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id}>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardDescription>{a.message}</CardDescription>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
