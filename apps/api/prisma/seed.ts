import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client
const prisma = new PrismaClient({ adapter });

/**
 * Database Seed Script
 * 
 * Creates test data for development:
 * - 2 test users
 * - 3 sites per user
 * - Sample metrics for each site
 * - Sample alerts for each site
 */

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.alert.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create test users
  console.log("👤 Creating test users...");
  const user1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
  });

  console.log(`✅ Created users: ${user1.email}, ${user2.email}`);

  // Create sites for user1
  console.log("🌐 Creating test sites...");
  const site1 = await prisma.site.create({
    data: {
      userId: user1.id,
      name: "My Portfolio",
      url: "https://johndoe.com",
      domain: "johndoe.com",
      siteId: "site_" + Math.random().toString(36).substring(2, 15),
      isActive: true,
    },
  });

  const site2 = await prisma.site.create({
    data: {
      userId: user1.id,
      name: "E-commerce Store",
      url: "https://mystore.com",
      domain: "mystore.com",
      siteId: "site_" + Math.random().toString(36).substring(2, 15),
      isActive: true,
    },
  });

  const site3 = await prisma.site.create({
    data: {
      userId: user1.id,
      name: "Blog",
      url: "https://myblog.com",
      domain: "myblog.com",
      siteId: "site_" + Math.random().toString(36).substring(2, 15),
      isActive: false,
    },
  });

  // Create sites for user2
  const site4 = await prisma.site.create({
    data: {
      userId: user2.id,
      name: "Company Website",
      url: "https://acmecorp.com",
      domain: "acmecorp.com",
      siteId: "site_" + Math.random().toString(36).substring(2, 15),
      isActive: true,
    },
  });

  const site5 = await prisma.site.create({
    data: {
      userId: user2.id,
      name: "Landing Page",
      url: "https://product.io",
      domain: "product.io",
      siteId: "site_" + Math.random().toString(36).substring(2, 15),
      isActive: true,
    },
  });

  const site6 = await prisma.site.create({
    data: {
      userId: user2.id,
      name: "Documentation",
      url: "https://docs.example.com",
      domain: "docs.example.com",
      siteId: "site_" + Math.random().toString(36).substring(2, 15),
      isActive: true,
    },
  });

  console.log(`✅ Created 6 sites`);

  // Create sample metrics for each site
  console.log("📊 Creating sample metrics...");
  const sites = [site1, site2, site3, site4, site5, site6];
  const deviceTypes = ["desktop", "mobile", "tablet"];
  const browsers = ["chrome", "firefox", "safari", "edge"];
  const osNames = ["Windows", "macOS", "Linux", "iOS", "Android"];

  let metricsCount = 0;

  for (const site of sites) {
    // Create metrics for the last 30 days
    for (let day = 0; day < 30; day++) {
      const metricsPerDay = Math.floor(Math.random() * 10) + 5; // 5-15 metrics per day

      for (let i = 0; i < metricsPerDay; i++) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));

        await prisma.metric.create({
          data: {
            siteId: site.id,
            lcp: Math.random() * 3000 + 1000, // 1000-4000ms
            fid: Math.random() * 200 + 50, // 50-250ms
            cls: Math.random() * 0.3, // 0-0.3
            ttfb: Math.random() * 800 + 200, // 200-1000ms
            fcp: Math.random() * 2000 + 500, // 500-2500ms
            tti: Math.random() * 4000 + 2000, // 2000-6000ms
            deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
            browserName: browsers[Math.floor(Math.random() * browsers.length)],
            osName: osNames[Math.floor(Math.random() * osNames.length)],
            pageUrl: `${site.url}/page-${Math.floor(Math.random() * 10)}`,
            pageTitle: `Page ${Math.floor(Math.random() * 10)}`,
            connectionType: Math.random() > 0.5 ? "4g" : "wifi",
            effectiveType: Math.random() > 0.5 ? "4g" : "3g",
            rtt: Math.floor(Math.random() * 100) + 20,
            downlink: Math.random() * 10 + 1,
            sessionId: "session_" + Math.random().toString(36).substring(2, 15),
            timestamp,
          },
        });
        metricsCount++;
      }
    }
  }

  console.log(`✅ Created ${metricsCount} metrics`);

  // Create sample alerts
  console.log("🔔 Creating sample alerts...");
  const metricTypes = ["lcp", "fid", "cls"];
  const conditions = ["greater_than", "less_than"];

  const alerts = [];

  // Create 2-3 alerts per site
  for (const site of sites) {
    const alertCount = Math.floor(Math.random() * 2) + 2; // 2-3 alerts

    for (let i = 0; i < alertCount; i++) {
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      let threshold: number;

      // Set realistic thresholds based on metric type
      switch (metricType) {
        case "lcp":
          threshold = 2500; // 2.5 seconds
          break;
        case "fid":
          threshold = 100; // 100ms
          break;
        case "cls":
          threshold = 0.1; // 0.1 score
          break;
        default:
          threshold = 1000;
      }

      const alert = await prisma.alert.create({
        data: {
          userId: site.userId,
          siteId: site.id,
          metricType,
          threshold,
          condition: "greater_than",
          isActive: Math.random() > 0.3, // 70% active
        },
      });
      alerts.push(alert);
    }
  }

  console.log(`✅ Created ${alerts.length} alerts`);

  console.log("\n✨ Database seed completed successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("   Email: john@example.com");
  console.log("   Password: password123");
  console.log("\n   Email: jane@example.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
