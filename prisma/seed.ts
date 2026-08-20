import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password, role: "Admin" },
  });

  const maker = await prisma.user.upsert({
    where: { username: "maker" },
    update: {},
    create: { username: "maker", password, role: "PluginMaker" },
  });

  await prisma.user.upsert({
    where: { username: "dev" },
    update: {},
    create: { username: "dev", password, role: "Developer" },
  });

  await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: { username: "user", password, role: "User" },
  });

  const plugin1 = await prisma.plugin.create({
    data: {
      name: "EcoBoost Economy",
      description: "A lightweight, highly configurable economy plugin with shops, jobs, and banking.",
      version: "2.4.1",
      price: 0,
      isFree: true,
      status: "Approved",
      downloadCount: 142,
      creatorId: maker.id,
    },
  });

  const plugin2 = await prisma.plugin.create({
    data: {
      name: "GuardianShield AntiCheat",
      description: "Advanced anti-cheat detection with low false-positive rates and detailed reports.",
      version: "5.0.0",
      price: 499,
      isFree: false,
      status: "Approved",
      downloadCount: 58,
      creatorId: maker.id,
    },
  });

  await prisma.plugin.create({
    data: {
      name: "SkyRealms Islands",
      description: "Feature-rich skyblock island management with upgrades, challenges, and leaderboards.",
      version: "1.2.0",
      price: 299,
      isFree: false,
      status: "Pending",
      creatorId: maker.id,
    },
  });

  await prisma.server.createMany({
    data: [
      { name: "QuickCraft SkyBlock", status: "Online", players: 214, maxPlayers: 500, version: "1.21.1", ip: "sky.quickplugins.net" },
      { name: "QuickCraft Survival", status: "Online", players: 87, maxPlayers: 200, version: "1.21.1", ip: "survival.quickplugins.net" },
      { name: "QuickCraft Creative", status: "Offline", players: 0, maxPlayers: 100, version: "1.20.6", ip: "creative.quickplugins.net" },
    ],
  });

  // Linked to one of maker's plugins, but per the license model this unlocks maker's ENTIRE
  // catalog (EcoBoost + GuardianShield, and any future approved plugin they publish).
  await prisma.license.create({
    data: {
      name: "Maker All-Access License",
      key: "QP-SAMPLE1234567890",
      minecraftIp: "survival.quickplugins.net",
      oneTimeUse: false,
      pluginId: plugin2.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Welcome to QUICK PLUGINS",
      message: "Our freemium marketplace is now live! Browse plugins, redeem licenses, and join our servers.",
    },
  });

  console.log("Seed complete. Demo accounts (password: password123):");
  console.log("  admin / maker / dev / user");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
