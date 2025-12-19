/**
 * Unit tests for metric utilities
 */

import { describe, it, expect } from "vitest";
import {
  getMetricStatus,
  getMetricColor,
  getMetricStatusLabel,
  getMetricUnit,
  METRIC_THRESHOLDS,
} from "./metrics";

describe("metrics utilities", () => {
  describe("getMetricStatus", () => {
    describe("LCP (Largest Contentful Paint)", () => {
      it("should return 'good' for values <= 2500ms", () => {
        expect(getMetricStatus("lcp", 1000)).toBe("good");
        expect(getMetricStatus("lcp", 2500)).toBe("good");
      });

      it("should return 'needs-improvement' for values between 2500ms and 4000ms", () => {
        expect(getMetricStatus("lcp", 2501)).toBe("needs-improvement");
        expect(getMetricStatus("lcp", 3000)).toBe("needs-improvement");
        expect(getMetricStatus("lcp", 4000)).toBe("needs-improvement");
      });

      it("should return 'poor' for values > 4000ms", () => {
        expect(getMetricStatus("lcp", 4001)).toBe("poor");
        expect(getMetricStatus("lcp", 5000)).toBe("poor");
      });
    });

    describe("FID (First Input Delay)", () => {
      it("should return 'good' for values <= 100ms", () => {
        expect(getMetricStatus("fid", 50)).toBe("good");
        expect(getMetricStatus("fid", 100)).toBe("good");
      });

      it("should return 'needs-improvement' for values between 100ms and 300ms", () => {
        expect(getMetricStatus("fid", 101)).toBe("needs-improvement");
        expect(getMetricStatus("fid", 200)).toBe("needs-improvement");
        expect(getMetricStatus("fid", 300)).toBe("needs-improvement");
      });

      it("should return 'poor' for values > 300ms", () => {
        expect(getMetricStatus("fid", 301)).toBe("poor");
        expect(getMetricStatus("fid", 400)).toBe("poor");
      });
    });

    describe("CLS (Cumulative Layout Shift)", () => {
      it("should return 'good' for values <= 0.1", () => {
        expect(getMetricStatus("cls", 0.05)).toBe("good");
        expect(getMetricStatus("cls", 0.1)).toBe("good");
      });

      it("should return 'needs-improvement' for values between 0.1 and 0.25", () => {
        expect(getMetricStatus("cls", 0.11)).toBe("needs-improvement");
        expect(getMetricStatus("cls", 0.2)).toBe("needs-improvement");
        expect(getMetricStatus("cls", 0.25)).toBe("needs-improvement");
      });

      it("should return 'poor' for values > 0.25", () => {
        expect(getMetricStatus("cls", 0.26)).toBe("poor");
        expect(getMetricStatus("cls", 0.4)).toBe("poor");
      });
    });

    describe("TTFB (Time to First Byte)", () => {
      it("should return 'good' for values <= 800ms", () => {
        expect(getMetricStatus("ttfb", 500)).toBe("good");
        expect(getMetricStatus("ttfb", 800)).toBe("good");
      });

      it("should return 'needs-improvement' for values between 800ms and 1800ms", () => {
        expect(getMetricStatus("ttfb", 801)).toBe("needs-improvement");
        expect(getMetricStatus("ttfb", 1000)).toBe("needs-improvement");
        expect(getMetricStatus("ttfb", 1800)).toBe("needs-improvement");
      });

      it("should return 'poor' for values > 1800ms", () => {
        expect(getMetricStatus("ttfb", 1801)).toBe("poor");
        expect(getMetricStatus("ttfb", 2000)).toBe("poor");
      });
    });

    describe("FCP (First Contentful Paint)", () => {
      it("should return 'good' for values <= 1800ms", () => {
        expect(getMetricStatus("fcp", 1000)).toBe("good");
        expect(getMetricStatus("fcp", 1800)).toBe("good");
      });

      it("should return 'needs-improvement' for values between 1800ms and 3000ms", () => {
        expect(getMetricStatus("fcp", 1801)).toBe("needs-improvement");
        expect(getMetricStatus("fcp", 2500)).toBe("needs-improvement");
        expect(getMetricStatus("fcp", 3000)).toBe("needs-improvement");
      });

      it("should return 'poor' for values > 3000ms", () => {
        expect(getMetricStatus("fcp", 3001)).toBe("poor");
        expect(getMetricStatus("fcp", 4000)).toBe("poor");
      });
    });
  });

  describe("getMetricColor", () => {
    it("should return green classes for 'good' status", () => {
      const color = getMetricColor("good");
      expect(color).toContain("text-green-600");
      expect(color).toContain("bg-green-100");
    });

    it("should return yellow classes for 'needs-improvement' status", () => {
      const color = getMetricColor("needs-improvement");
      expect(color).toContain("text-yellow-600");
      expect(color).toContain("bg-yellow-100");
    });

    it("should return red classes for 'poor' status", () => {
      const color = getMetricColor("poor");
      expect(color).toContain("text-red-600");
      expect(color).toContain("bg-red-100");
    });

    it("should include dark mode classes", () => {
      expect(getMetricColor("good")).toContain("dark:");
      expect(getMetricColor("needs-improvement")).toContain("dark:");
      expect(getMetricColor("poor")).toContain("dark:");
    });
  });

  describe("getMetricStatusLabel", () => {
    it("should return 'Good' for 'good' status", () => {
      expect(getMetricStatusLabel("good")).toBe("Good");
    });

    it("should return 'Needs Improvement' for 'needs-improvement' status", () => {
      expect(getMetricStatusLabel("needs-improvement")).toBe("Needs Improvement");
    });

    it("should return 'Poor' for 'poor' status", () => {
      expect(getMetricStatusLabel("poor")).toBe("Poor");
    });
  });

  describe("getMetricUnit", () => {
    it("should return 'ms' for time-based metrics", () => {
      expect(getMetricUnit("lcp")).toBe("ms");
      expect(getMetricUnit("fid")).toBe("ms");
      expect(getMetricUnit("ttfb")).toBe("ms");
      expect(getMetricUnit("fcp")).toBe("ms");
    });

    it("should return empty string for CLS", () => {
      expect(getMetricUnit("cls")).toBe("");
    });
  });

  describe("METRIC_THRESHOLDS", () => {
    it("should have correct LCP thresholds", () => {
      expect(METRIC_THRESHOLDS.lcp.good).toBe(2500);
      expect(METRIC_THRESHOLDS.lcp.poor).toBe(4000);
    });

    it("should have correct FID thresholds", () => {
      expect(METRIC_THRESHOLDS.fid.good).toBe(100);
      expect(METRIC_THRESHOLDS.fid.poor).toBe(300);
    });

    it("should have correct CLS thresholds", () => {
      expect(METRIC_THRESHOLDS.cls.good).toBe(0.1);
      expect(METRIC_THRESHOLDS.cls.poor).toBe(0.25);
    });

    it("should have correct TTFB thresholds", () => {
      expect(METRIC_THRESHOLDS.ttfb.good).toBe(800);
      expect(METRIC_THRESHOLDS.ttfb.poor).toBe(1800);
    });

    it("should have correct FCP thresholds", () => {
      expect(METRIC_THRESHOLDS.fcp.good).toBe(1800);
      expect(METRIC_THRESHOLDS.fcp.poor).toBe(3000);
    });
  });
});
