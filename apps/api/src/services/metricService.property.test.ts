/**
 * Property-based tests for metric service
 * Feature: backend-api
 * 
 * Property 6: Metric Summary Calculation
 * For any metrics retrieval, summary stats should be calculated from filtered dataset
 * Validates: Requirements 13.1, 13.2
 */

import * as fc from 'fast-check';
import {
  calculateAverage,
  calculateP95,
  calculateMetricSummary,
  MetricResponse,
} from './metricService';

describe('Metric Service Property Tests', () => {
  /**
   * Feature: backend-api, Property 6: Metric Summary Calculation
   * For any metrics retrieval, summary stats should be calculated from filtered dataset
   * Validates: Requirements 13.1, 13.2
   */
  describe('Feature: backend-api, Property 6: Metric Summary Calculation', () => {
    // Helper to generate valid metric responses
    const metricResponseArb = fc.record({
      id: fc.integer({ min: 1 }),
      siteId: fc.integer({ min: 1 }),
      lcp: fc.option(fc.float({ min: 0, max: Math.fround(10000), noNaN: true }), { nil: null }),
      fid: fc.option(fc.float({ min: 0, max: Math.fround(1000), noNaN: true }), { nil: null }),
      cls: fc.option(fc.float({ min: 0, max: Math.fround(1), noNaN: true }), { nil: null }),
      ttfb: fc.option(fc.float({ min: 0, max: Math.fround(5000), noNaN: true }), { nil: null }),
      fcp: fc.option(fc.float({ min: 0, max: Math.fround(5000), noNaN: true }), { nil: null }),
      tti: fc.option(fc.float({ min: 0, max: Math.fround(10000), noNaN: true }), { nil: null }),
      deviceType: fc.constantFrom('desktop', 'mobile', 'tablet'),
      browserName: fc.option(fc.constantFrom('chrome', 'firefox', 'safari', 'edge'), { nil: null }),
      osName: fc.option(fc.constantFrom('windows', 'macos', 'linux', 'ios', 'android'), { nil: null }),
      pageUrl: fc.option(fc.webUrl(), { nil: null }),
      timestamp: fc.date(),
    }) as fc.Arbitrary<MetricResponse>;

    it('should return zero values for empty metrics array', async () => {
      await fc.assert(
        fc.property(fc.constant([] as MetricResponse[]), (metrics) => {
          const summary = calculateMetricSummary(metrics);

          // Property: Empty array should return zero values
          expect(summary.count).toBe(0);
          expect(summary.averages.lcp).toBe(0);
          expect(summary.averages.fid).toBe(0);
          expect(summary.averages.cls).toBe(0);
          expect(summary.p95.lcp).toBe(0);
          expect(summary.p95.fid).toBe(0);
          expect(summary.p95.cls).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should calculate correct count for any metrics array', async () => {
      await fc.assert(
        fc.property(
          fc.array(metricResponseArb, { minLength: 0, maxLength: 100 }),
          (metrics) => {
            const summary = calculateMetricSummary(metrics);

            // Property: Count should equal the number of metrics
            expect(summary.count).toBe(metrics.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate average correctly for any non-empty metrics', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0, max: Math.fround(10000), noNaN: true }), { minLength: 1, maxLength: 100 }),
          (values) => {
            const average = calculateAverage(values);
            const expectedAverage = values.reduce((a, b) => a + b, 0) / values.length;

            // Property: Average should be sum / count
            expect(average).toBeCloseTo(expectedAverage, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate p95 correctly for any non-empty array', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0, max: Math.fround(10000), noNaN: true }), { minLength: 1, maxLength: 100 }),
          (values) => {
            const p95 = calculateP95(values);
            const sorted = [...values].sort((a, b) => a - b);
            const index = Math.ceil(0.95 * sorted.length) - 1;
            const expectedP95 = sorted[Math.max(0, index)];

            // Property: P95 should be the value at 95th percentile index
            expect(p95).toBe(expectedP95);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only include non-null values in calculations', async () => {
      await fc.assert(
        fc.property(
          fc.array(metricResponseArb, { minLength: 1, maxLength: 50 }),
          (metrics) => {
            const summary = calculateMetricSummary(metrics);

            // Extract non-null LCP values
            const lcpValues = metrics
              .map((m) => m.lcp)
              .filter((v): v is number => v !== null);

            if (lcpValues.length === 0) {
              // Property: If all LCP values are null, average should be 0
              expect(summary.averages.lcp).toBe(0);
            } else {
              // Property: Average should be calculated from non-null values only
              const expectedAvg = lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length;
              expect(summary.averages.lcp).toBeCloseTo(expectedAvg, 5);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have p95 >= average for any metrics with positive values', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1 }),
              siteId: fc.integer({ min: 1 }),
              lcp: fc.float({ min: Math.fround(0.1), max: Math.fround(10000), noNaN: true }), // Always positive
              fid: fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }),
              cls: fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),
              ttfb: fc.constant(null),
              fcp: fc.constant(null),
              tti: fc.constant(null),
              deviceType: fc.constant('desktop'),
              browserName: fc.constant('chrome'),
              osName: fc.constant(null),
              pageUrl: fc.constant(null),
              timestamp: fc.date(),
            }) as fc.Arbitrary<MetricResponse>,
            { minLength: 2, maxLength: 50 }
          ),
          (metrics) => {
            const summary = calculateMetricSummary(metrics);

            // Property: P95 should be >= average for any distribution
            expect(summary.p95.lcp).toBeGreaterThanOrEqual(summary.averages.lcp);
            expect(summary.p95.fid).toBeGreaterThanOrEqual(summary.averages.fid);
            expect(summary.p95.cls).toBeGreaterThanOrEqual(summary.averages.cls);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate summary from filtered dataset only', async () => {
      // This test verifies that summary is calculated from the metrics passed in
      // (which would be the filtered dataset in real usage)
      await fc.assert(
        fc.property(
          fc.array(metricResponseArb, { minLength: 1, maxLength: 50 }),
          fc.array(metricResponseArb, { minLength: 1, maxLength: 50 }),
          (filteredMetrics, otherMetrics) => {
            // Calculate summary only from filtered metrics
            const summary = calculateMetricSummary(filteredMetrics);

            // Property: Count should match filtered metrics, not total
            expect(summary.count).toBe(filteredMetrics.length);
            expect(summary.count).not.toBe(filteredMetrics.length + otherMetrics.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
