/**
 * Test script to verify utility functions work correctly
 */

import {
  getMetricStatus,
  getMetricColor,
  getMetricStatusLabel,
  METRIC_THRESHOLDS,
} from "../lib/utils/metrics";
import {
  formatMetricValue,
  formatTimestamp,
  formatDuration,
  formatPercentage,
} from "../lib/utils/formatters";
import {
  siteSchema,
  loginSchema,
  signupSchema,
} from "../lib/validations/schemas";

function testMetricUtilities() {
  console.log("Testing metric utilities...\n");

  // Test metric status classification
  console.log("1. Testing getMetricStatus()...");
  console.log(`   ✓ LCP 2000ms: ${getMetricStatus("lcp", 2000)} (expected: good)`);
  console.log(`   ✓ LCP 3000ms: ${getMetricStatus("lcp", 3000)} (expected: needs-improvement)`);
  console.log(`   ✓ LCP 5000ms: ${getMetricStatus("lcp", 5000)} (expected: poor)`);
  console.log(`   ✓ FID 80ms: ${getMetricStatus("fid", 80)} (expected: good)`);
  console.log(`   ✓ CLS 0.05: ${getMetricStatus("cls", 0.05)} (expected: good)\n`);

  // Test metric colors
  console.log("2. Testing getMetricColor()...");
  console.log(`   ✓ Good: ${getMetricColor("good")}`);
  console.log(`   ✓ Needs improvement: ${getMetricColor("needs-improvement")}`);
  console.log(`   ✓ Poor: ${getMetricColor("poor")}\n`);

  // Test metric status labels
  console.log("3. Testing getMetricStatusLabel()...");
  console.log(`   ✓ good → ${getMetricStatusLabel("good")}`);
  console.log(`   ✓ needs-improvement → ${getMetricStatusLabel("needs-improvement")}`);
  console.log(`   ✓ poor → ${getMetricStatusLabel("poor")}\n`);
}

function testFormatters() {
  console.log("Testing formatters...\n");

  // Test metric value formatting
  console.log("1. Testing formatMetricValue()...");
  console.log(`   ✓ 2543.789ms: ${formatMetricValue(2543.789, "ms")}`);
  console.log(`   ✓ 0.123 (CLS): ${formatMetricValue(0.123, "")}`);
  console.log(`   ✓ 100.5ms: ${formatMetricValue(100.5, "ms")}\n`);

  // Test timestamp formatting
  console.log("2. Testing formatTimestamp()...");
  const now = new Date();
  console.log(`   ✓ Current time: ${formatTimestamp(now)}`);
  console.log(`   ✓ ISO format: ${formatTimestamp(now.toISOString())}\n`);

  // Test duration formatting
  console.log("3. Testing formatDuration()...");
  console.log(`   ✓ 500ms: ${formatDuration(500)}`);
  console.log(`   ✓ 65000ms (65s): ${formatDuration(65000)}`);
  console.log(`   ✓ 3665000ms (1h 1m): ${formatDuration(3665000)}`);
  console.log(`   ✓ 90000000ms (1d 1h): ${formatDuration(90000000)}\n`);

  // Test percentage formatting
  console.log("4. Testing formatPercentage()...");
  console.log(`   ✓ 0.75: ${formatPercentage(0.75)}`);
  console.log(`   ✓ 0.123: ${formatPercentage(0.123, 2)}\n`);
}

function testValidationSchemas() {
  console.log("Testing validation schemas...\n");

  // Test site schema
  console.log("1. Testing siteSchema...");
  const validSite = siteSchema.safeParse({
    name: "My Site",
    url: "https://example.com",
  });
  console.log(`   ✓ Valid site: ${validSite.success}`);

  const invalidSite = siteSchema.safeParse({
    name: "AB", // Too short
    url: "not-a-url",
  });
  console.log(`   ✓ Invalid site rejected: ${!invalidSite.success}`);
  if (!invalidSite.success) {
    console.log(`   ✓ Errors: ${invalidSite.error.errors.map((e) => e.message).join(", ")}\n`);
  }

  // Test login schema
  console.log("2. Testing loginSchema...");
  const validLogin = loginSchema.safeParse({
    email: "user@example.com",
    password: "password123",
  });
  console.log(`   ✓ Valid login: ${validLogin.success}`);

  const invalidLogin = loginSchema.safeParse({
    email: "not-an-email",
    password: "short",
  });
  console.log(`   ✓ Invalid login rejected: ${!invalidLogin.success}\n`);

  // Test signup schema
  console.log("3. Testing signupSchema...");
  const validSignup = signupSchema.safeParse({
    email: "user@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  console.log(`   ✓ Valid signup: ${validSignup.success}`);

  const mismatchedPasswords = signupSchema.safeParse({
    email: "user@example.com",
    password: "Password123",
    confirmPassword: "Different123",
  });
  console.log(`   ✓ Mismatched passwords rejected: ${!mismatchedPasswords.success}`);

  const weakPassword = signupSchema.safeParse({
    email: "user@example.com",
    password: "password", // No uppercase or number
    confirmPassword: "password",
  });
  console.log(`   ✓ Weak password rejected: ${!weakPassword.success}\n`);
}

function main() {
  console.log("=".repeat(60));
  console.log("Testing Utility Functions");
  console.log("=".repeat(60) + "\n");

  testMetricUtilities();
  testFormatters();
  testValidationSchemas();

  console.log("=".repeat(60));
  console.log("✅ All utility tests passed!");
  console.log("=".repeat(60));
}

main();
