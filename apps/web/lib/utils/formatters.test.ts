/**
 * Unit tests for formatting utilities
 */

import { describe, it, expect } from "vitest";
import {
  formatMetricValue,
  formatTimestamp,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatPercentage,
} from "./formatters";

describe("formatters utilities", () => {
  describe("formatMetricValue", () => {
    it("should format time values with ms unit", () => {
      expect(formatMetricValue(1234.567, "ms")).toBe("1234.57ms");
      expect(formatMetricValue(100, "ms")).toBe("100ms");
    });

    it("should remove trailing zeros for time values", () => {
      expect(formatMetricValue(1000, "ms")).toBe("1000ms");
      expect(formatMetricValue(1000.5, "ms")).toBe("1000.5ms");
    });

    it("should format unitless values with appropriate precision", () => {
      expect(formatMetricValue(0.123456, "")).toBe("0.12");
      expect(formatMetricValue(0.1, "")).toBe("0.1");
    });

    it("should remove trailing zeros for unitless values", () => {
      expect(formatMetricValue(0.1, "")).toBe("0.1");
      expect(formatMetricValue(0.100, "")).toBe("0.1");
    });

    it("should handle zero values", () => {
      expect(formatMetricValue(0, "ms")).toBe("0ms");
      expect(formatMetricValue(0, "")).toBe("0");
    });

    it("should round to 2 decimal places", () => {
      expect(formatMetricValue(1.999, "ms")).toBe("2ms");
      expect(formatMetricValue(1.995, "ms")).toBe("2ms");
    });
  });

  describe("formatTimestamp", () => {
    it("should format ISO timestamp strings", () => {
      const timestamp = "2025-12-18T10:30:00Z";
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toMatch(/Dec 18, 2025/);
    });

    it("should format Date objects", () => {
      const date = new Date("2025-12-18T10:30:00Z");
      const formatted = formatTimestamp(date);
      expect(formatted).toMatch(/Dec 18, 2025/);
    });

    it("should use custom format string", () => {
      const timestamp = "2025-12-18T10:30:00Z";
      const formatted = formatTimestamp(timestamp, "yyyy-MM-dd");
      expect(formatted).toBe("2025-12-18");
    });

    it("should handle invalid dates", () => {
      expect(formatTimestamp("invalid")).toBe("Invalid date");
    });
  });

  describe("formatRelativeTime", () => {
    it("should format recent timestamps", () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const formatted = formatRelativeTime(twoHoursAgo);
      expect(formatted).toContain("ago");
    });

    it("should handle Date objects", () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const formatted = formatRelativeTime(oneMinuteAgo);
      expect(formatted).toContain("ago");
    });

    it("should handle invalid dates", () => {
      expect(formatRelativeTime("invalid")).toBe("Invalid date");
    });
  });

  describe("formatDuration", () => {
    it("should format milliseconds", () => {
      expect(formatDuration(500)).toBe("500ms");
      expect(formatDuration(999)).toBe("999ms");
    });

    it("should format seconds", () => {
      expect(formatDuration(1000)).toBe("1s");
      expect(formatDuration(45000)).toBe("45s");
    });

    it("should format minutes", () => {
      expect(formatDuration(60000)).toBe("1m");
      expect(formatDuration(90000)).toBe("1m 30s");
      expect(formatDuration(120000)).toBe("2m");
    });

    it("should format hours", () => {
      expect(formatDuration(3600000)).toBe("1h");
      expect(formatDuration(5400000)).toBe("1h 30m");
      expect(formatDuration(7200000)).toBe("2h");
    });

    it("should format days", () => {
      expect(formatDuration(86400000)).toBe("1d");
      expect(formatDuration(90000000)).toBe("1d 1h");
      expect(formatDuration(172800000)).toBe("2d");
    });

    it("should handle zero and negative values", () => {
      expect(formatDuration(0)).toBe("0ms");
      expect(formatDuration(-1000)).toBe("0s");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with thousands separators", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
    });

    it("should handle small numbers", () => {
      expect(formatNumber(100)).toBe("100");
      expect(formatNumber(0)).toBe("0");
    });

    it("should handle decimal numbers", () => {
      const formatted = formatNumber(1234.56);
      expect(formatted).toContain("1,234");
    });
  });

  describe("formatPercentage", () => {
    it("should format decimal values as percentages", () => {
      expect(formatPercentage(0.75)).toBe("75.0%");
      expect(formatPercentage(0.5)).toBe("50.0%");
    });

    it("should respect decimal places parameter", () => {
      expect(formatPercentage(0.12345, 2)).toBe("12.35%");
      expect(formatPercentage(0.12345, 0)).toBe("12%");
    });

    it("should handle zero and one", () => {
      expect(formatPercentage(0)).toBe("0.0%");
      expect(formatPercentage(1)).toBe("100.0%");
    });

    it("should handle values over 100%", () => {
      expect(formatPercentage(1.5)).toBe("150.0%");
    });
  });
});
