"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

type Me = { userId: string; username: string; role: string } | null;

const navLinks = [
  { href: "/", label: "Main Home" },
  { href: "/licenses", label: "Licenses" },
  { href: "/plugins", label: "Plugins" },
  { href: "/servers", label: "Servers" },
  { href: "/founder", label: "Founder - Owner" },
  { href: "/plugin-maker", label: "Plugin Maker" },
  { href: "/developer", label: "Developer" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  }

  const links = me?.role === "Admin" ? [...navLinks, { href: "/admin", label: "Everything" }] : navLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-purple">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            QUICK <span className="text-cyan">PLUGINS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors hover:text-cyan ${
                pathname === l.href ? "text-cyan" : "text-gray-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {me ? (
            <>
              <span className="text-xs text-gray-400">
                {me.username} · <span className="text-purple-glow">{me.role}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-300" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {me ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login"><Button variant="outline" size="sm">Login</Button></Link>
                  <Link href="/register"><Button variant="primary" size="sm">Register</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
