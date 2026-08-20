import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "QUICK PLUGINS — Minecraft Plugins, Licenses & Servers",
  description:
    "QUICK PLUGINS is a freemium marketplace for Minecraft plugins, secure license keys, and server listings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
