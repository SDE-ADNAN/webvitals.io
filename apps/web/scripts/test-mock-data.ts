/**
 * Test script to verify mock data functions work correctly
 */

import { getMockSites, getMockSite } from "../lib/mock-data/mockSites";
import { generateMockMetrics, getMockMetrics } from "../lib/mock-data/mockMetrics";

async function testMockData() {
  console.log("Testing mock data functions...\n");

  // Test getMockSites
  console.log("1. Testing getMockSites()...");
  const sites = await getMockSites();
  console.log(`   ✓ Returned ${sites.length} sites`);
  if (sites[0]) {
    console.log(`   ✓ First site: ${sites[0].name} (${sites[0].url})`);
  }
  console.log(`   ✓ Site IDs: ${sites.map((s) => s.siteId).join(", ")}\n`);

  // Test getMockSite
  console.log("2. Testing getMockSite()...");
  const site = await getMockSite("site_abc123");
  if (site) {
    console.log(`   ✓ Found site: ${site.name}`);
    console.log(`   ✓ Site URL: ${site.url}\n`);
  } else {
    console.log("   ✗ Site not found\n");
  }

  // Test getMockSite with invalid ID
  console.log("3. Testing getMockSite() with invalid ID...");
  const invalidSite = await getMockSite("invalid_id");
  console.log(`   ✓ Returns null for invalid ID: ${invalidSite === null}\n`);

  // Test generateMockMetrics
  console.log("4. Testing generateMockMetrics()...");
  const metrics = generateMockMetrics("1", 10);
  console.log(`   ✓ Generated ${metrics.length} metrics`);
  if (metrics[0]) {
    console.log(`   ✓ First metric LCP: ${metrics[0].lcp?.toFixed(2)} ms`);
    console.log(`   ✓ First metric FID: ${metrics[0].fid?.toFixed(2)} ms`);
    console.log(`   ✓ First metric CLS: ${metrics[0].cls?.toFixed(3)}`);
  }
  console.log(`   ✓ Device types: ${[...new Set(metrics.map((m) => m.deviceType))].join(", ")}`);
  console.log(`   ✓ Browsers: ${[...new Set(metrics.map((m) => m.browserName))].join(", ")}\n`);

  // Test getMockMetrics with filters
  console.log("5. Testing getMockMetrics() with filters...");
  const { metrics: filteredMetrics, summary } = await getMockMetrics("1", {
    deviceType: "mobile",
    timeRange: "24h",
  });
  console.log(`   ✓ Filtered metrics count: ${filteredMetrics.length}`);
  console.log(`   ✓ All metrics are mobile: ${filteredMetrics.every((m) => m.deviceType === "mobile")}`);
  console.log(`   ✓ Summary avg LCP: ${summary.avgLcp.toFixed(2)} ms`);
  console.log(`   ✓ Summary avg FID: ${summary.avgFid.toFixed(2)} ms`);
  console.log(`   ✓ Summary avg CLS: ${summary.avgCls.toFixed(3)}\n`);

  console.log("✅ All mock data tests passed!");
}

testMockData().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
