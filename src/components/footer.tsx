import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} <span className="text-cyan">QUICK PLUGINS</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/plugins" className="hover:text-cyan">Plugins</Link>
            <Link href="/servers" className="hover:text-cyan">Servers</Link>
            <Link href="/founder" className="hover:text-cyan">Founder</Link>
            <Link href="/developer" className="hover:text-cyan">Developer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
