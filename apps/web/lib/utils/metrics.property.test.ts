import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getMetricStatus, METRIC_THRESHOLDS } from "./metrics";

describe("Metric Classification Properties", () => {
  /**
   * Feature: frontend-dashboard, Property 25: Good Metric Status Indicator
   * For any metric value within good thresholds, the status should be "good"
   * Validates: Requirements 12.2, 28.1, 28.4, 28.7
   */
  describe("Property 25: Good Metric Status Indicator", () => {
    it("property: LCP values <= 2500ms are classified as good", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: METRIC_THRESHOLDS.lcp.good, noNaN: true }),
          (lcpValue) => {
            const status = getMetricStatus("lcp", lcpValue);
            return status === "good";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: FID values <= 100ms are classified as good", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: METRIC_THRESHOLDS.fid.good, noNaN: true }),
          (fidValue) => {
            const status = getMetricStatus("fid", fidValue);
            return status === "good";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: CLS values <= 0.1 are classified as good", () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: METRIC_THRESHOLDS.cls.good, noNaN: true }),
          (clsValue) => {
            const status = getMetricStatus("cls", clsValue);
            return status === "good";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: TTFB values <= 800ms are classified as good", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: METRIC_THRESHOLDS.ttfb.good, noNaN: true }),
          (ttfbValue) => {
            const status = getMetricStatus("ttfb", ttfbValue);
            return status === "good";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: FCP values <= 1800ms are classified as good", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: METRIC_THRESHOLDS.fcp.good, noNaN: true }),
          (fcpValue) => {
            const status = getMetricStatus("fcp", fcpValue);
            return status === "good";
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: frontend-dashboard, Property 26: Needs Improvement Metric Status Indicator
   * For any metric value in needs-improvement range, the status should be "needs-improvement"
   * Validates: Requirements 12.3, 28.2, 28.5, 28.8
   */
  describe("Property 26: Needs Improvement Metric Status Indicator", () => {
    it("property: LCP values between 2500-4000ms are classified as needs-improvement", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(METRIC_THRESHOLDS.lcp.good + 0.01),
            max: Math.fround(METRIC_THRESHOLDS.lcp.poor),
            noNaN: true,
          }),
          (lcpValue) => {
            const status = getMetricStatus("lcp", lcpValue);
            return status === "needs-improvement";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: FID values between 100-300ms are classified as needs-improvement", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(METRIC_THRESHOLDS.fid.good + 0.01),
            max: Math.fround(METRIC_THRESHOLDS.fid.poor),
            noNaN: true,
          }),
          (fidValue) => {
            const status = getMetricStatus("fid", fidValue);
            return status === "needs-improvement";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: CLS values between 0.1-0.25 are classified as needs-improvement", () => {
      fc.assert(
        fc.property(
          fc.double({
            min: METRIC_THRESHOLDS.cls.good + 0.001,
            max: METRIC_THRESHOLDS.cls.poor,
            noNaN: true,
          }),
          (clsValue) => {
            const status = getMetricStatus("cls", clsValue);
            return status === "needs-improvement";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: TTFB values between 800-1800ms are classified as needs-improvement", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(METRIC_THRESHOLDS.ttfb.good + 0.01),
            max: Math.fround(METRIC_THRESHOLDS.ttfb.poor),
            noNaN: true,
          }),
          (ttfbValue) => {
            const status = getMetricStatus("ttfb", ttfbValue);
            return status === "needs-improvement";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: FCP values between 1800-3000ms are classified as needs-improvement", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(METRIC_THRESHOLDS.fcp.good + 0.01),
            max: Math.fround(METRIC_THRESHOLDS.fcp.poor),
            noNaN: true,
          }),
          (fcpValue) => {
            const status = getMetricStatus("fcp", fcpValue);
            return status === "needs-improvement";
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: frontend-dashboard, Property 27: Poor Metric Status Indicator
   * For any metric value above poor threshold, the status should be "poor"
   * Validates: Requirements 12.4, 28.3, 28.6, 28.9
   */
  describe("Property 27: Poor Metric Status Indicator", () => {
    it("property: LCP values > 4000ms are classified as poor", () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(METRIC_THRESHOLDS.lcp.poor + 0.01), max: 10000, noNaN: true }),
          (lcpValue) => {
            const status = getMetricStatus("lcp", lcpValue);
            return status === "poor";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: FID values > 300ms are classified as poor", () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(METRIC_THRESHOLDS.fid.poor + 0.01), max: 1000, noNaN: true }),
          (fidValue) => {
            const status = getMetricStatus("fid", fidValue);
            return status === "poor";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: CLS values > 0.25 are classified as poor", () => {
      fc.assert(
        fc.property(
          fc.double({ min: METRIC_THRESHOLDS.cls.poor + 0.001, max: 1.0, noNaN: true }),
          (clsValue) => {
            const status = getMetricStatus("cls", clsValue);
            return status === "poor";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: TTFB values > 1800ms are classified as poor", () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(METRIC_THRESHOLDS.ttfb.poor + 0.01), max: 5000, noNaN: true }),
          (ttfbValue) => {
            const status = getMetricStatus("ttfb", ttfbValue);
            return status === "poor";
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: FCP values > 3000ms are classified as poor", () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(METRIC_THRESHOLDS.fcp.poor + 0.01), max: 10000, noNaN: true }),
          (fcpValue) => {
            const status = getMetricStatus("fcp", fcpValue);
            return status === "poor";
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Metric classification is exhaustive
   * For any metric value, it should be classified as one of the three statuses
   */
  describe("Additional Properties", () => {
    it("property: all metric values are classified into exactly one status", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("lcp", "fid", "cls", "ttfb", "fcp"),
          fc.float({ min: 0, max: 10000, noNaN: true }),
          (metricType, value) => {
            const status = getMetricStatus(
              metricType as keyof typeof METRIC_THRESHOLDS,
              value
            );
            return (
              status === "good" ||
              status === "needs-improvement" ||
              status === "poor"
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: boundary values at good threshold are classified as good", () => {
      const testCases: Array<[keyof typeof METRIC_THRESHOLDS, number]> = [
        ["lcp", METRIC_THRESHOLDS.lcp.good],
        ["fid", METRIC_THRESHOLDS.fid.good],
        ["cls", METRIC_THRESHOLDS.cls.good],
        ["ttfb", METRIC_THRESHOLDS.ttfb.good],
        ["fcp", METRIC_THRESHOLDS.fcp.good],
      ];

      return testCases.every(([metricType, threshold]) => {
        const status = getMetricStatus(metricType, threshold);
        return status === "good";
      });
    });

    it("property: boundary values at poor threshold are classified as needs-improvement", () => {
      const testCases: Array<[keyof typeof METRIC_THRESHOLDS, number]> = [
        ["lcp", METRIC_THRESHOLDS.lcp.poor],
        ["fid", METRIC_THRESHOLDS.fid.poor],
        ["cls", METRIC_THRESHOLDS.cls.poor],
        ["ttfb", METRIC_THRESHOLDS.ttfb.poor],
        ["fcp", METRIC_THRESHOLDS.fcp.poor],
      ];

      return testCases.every(([metricType, threshold]) => {
        const status = getMetricStatus(metricType, threshold);
        return status === "needs-improvement";
      });
    });
  });
});
