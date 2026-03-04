import * as fc from "fast-check";
import { Response } from "express";
import {
  formatTimestamp,
  formatTimestampsInObject,
  sendSuccess,
  sendCreated,
  sendPaginatedSuccess,
  calculatePagination,
  parsePaginationParams,
} from "./response";

// Feature: backend-api, Property 12: Consistent Response Format
// For any successful API response, status code should be 200 or 201
// **Validates: Requirements 26.1**

describe("Property-Based Tests: Response Formatting", () => {
  describe("Property 12: Consistent Response Format", () => {
    it("should always use 200 or 201 status codes for successful responses", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer(),
            name: fc.string(),
          }),
          (data) => {
            let capturedStatus: number | undefined;
            const mockRes = {
              status: jest.fn((code: number) => {
                capturedStatus = code;
                return mockRes;
              }),
              json: jest.fn(),
            } as unknown as Response;

            // Test sendSuccess
            sendSuccess(mockRes, data);
            expect(capturedStatus).toBe(200);

            // Test sendCreated
            sendCreated(mockRes, data);
            expect(capturedStatus).toBe(201);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should wrap all successful responses in consistent JSON structure", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer(),
            value: fc.string(),
          }),
          (data) => {
            let capturedResponse: any;
            const mockRes = {
              status: jest.fn(() => mockRes),
              json: jest.fn((response) => {
                capturedResponse = response;
              }),
            } as unknown as Response;

            sendSuccess(mockRes, data);

            // Response should have data and timestamp
            expect(capturedResponse).toHaveProperty("data");
            expect(capturedResponse).toHaveProperty("timestamp");
            expect(capturedResponse.data).toEqual(data);
            expect(typeof capturedResponse.timestamp).toBe("string");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should include pagination metadata for paginated responses", () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer() }), { maxLength: 50 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 1000 }),
          (data, page, limit, total) => {
            let capturedResponse: any;
            const mockRes = {
              status: jest.fn(() => mockRes),
              json: jest.fn((response) => {
                capturedResponse = response;
              }),
            } as unknown as Response;

            sendPaginatedSuccess(mockRes, data, { page, limit, total });

            // Response should have data, pagination, and timestamp
            expect(capturedResponse).toHaveProperty("data");
            expect(capturedResponse).toHaveProperty("pagination");
            expect(capturedResponse).toHaveProperty("timestamp");
            expect(capturedResponse.pagination).toHaveProperty("page");
            expect(capturedResponse.pagination).toHaveProperty("limit");
            expect(capturedResponse.pagination).toHaveProperty("total");
            expect(capturedResponse.pagination).toHaveProperty("totalPages");
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: backend-api, Property 13: ISO 8601 Timestamp Format
  // For any response with timestamps, they should be in ISO 8601 format
  // **Validates: Requirements 26.5**

  describe("Property 13: ISO 8601 Timestamp Format", () => {
    it("should format any Date object to ISO 8601 string", () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date("2000-01-01"), max: new Date("2099-12-31") }),
          (date) => {
            const result = formatTimestamp(date);
            
            // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            expect(result).toMatch(iso8601Regex);
            
            // Should be parseable back to a Date
            const parsed = new Date(result);
            expect(parsed.getTime()).toBe(date.getTime());
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should format all timestamps in nested objects to ISO 8601", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer(),
            createdAt: fc.date(),
            updatedAt: fc.date(),
            nested: fc.record({
              timestamp: fc.date(),
            }),
          }),
          (obj) => {
            const result = formatTimestampsInObject(obj);
            
            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            
            // All Date fields should be ISO 8601 strings
            expect(result.createdAt).toMatch(iso8601Regex);
            expect(result.updatedAt).toMatch(iso8601Regex);
            expect(result.nested.timestamp).toMatch(iso8601Regex);
            
            // Non-date fields should be unchanged
            expect(result.id).toBe(obj.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should format timestamps in arrays of objects", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              timestamp: fc.date(),
            }),
            { maxLength: 20 }
          ),
          (arr) => {
            const result = formatTimestampsInObject(arr);
            
            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            
            result.forEach((item, index) => {
              expect(item.timestamp).toMatch(iso8601Regex);
              expect(item.id).toBe(arr[index].id);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should include ISO 8601 timestamp in all response types", () => {
      fc.assert(
        fc.property(
          fc.record({ id: fc.integer() }),
          (data) => {
            let capturedResponse: any;
            const mockRes = {
              status: jest.fn(() => mockRes),
              json: jest.fn((response) => {
                capturedResponse = response;
              }),
            } as unknown as Response;

            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

            // Test sendSuccess
            sendSuccess(mockRes, data);
            expect(capturedResponse.timestamp).toMatch(iso8601Regex);

            // Test sendCreated
            sendCreated(mockRes, data);
            expect(capturedResponse.timestamp).toMatch(iso8601Regex);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Pagination Properties", () => {
    it("should always calculate correct totalPages", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 10000 }),
          (limit, total) => {
            const result = calculatePagination(1, limit, total);
            
            const expectedPages = Math.ceil(total / result.limit);
            expect(result.totalPages).toBe(expectedPages);
            
            // Total pages should never be negative
            expect(result.totalPages).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should enforce pagination constraints", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 1000 }),
          fc.integer({ min: -100, max: 1000 }),
          fc.integer({ min: 0, max: 10000 }),
          (page, limit, total) => {
            const result = calculatePagination(page, limit, total);
            
            // Page should always be at least 1
            expect(result.page).toBeGreaterThanOrEqual(1);
            
            // Limit should be between 1 and 100
            expect(result.limit).toBeGreaterThanOrEqual(1);
            expect(result.limit).toBeLessThanOrEqual(100);
            
            // Total should match input
            expect(result.total).toBe(total);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should parse pagination params safely", () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer().map(String), { nil: undefined }),
          fc.option(fc.integer().map(String), { nil: undefined }),
          (page, limit) => {
            const query = {
              ...(page !== undefined && { page }),
              ...(limit !== undefined && { limit }),
            };
            
            const result = parsePaginationParams(query);
            
            // Should always return valid page and limit
            expect(result.page).toBeGreaterThanOrEqual(1);
            expect(result.limit).toBeGreaterThanOrEqual(1);
            expect(result.limit).toBeLessThanOrEqual(100);
            
            // Should be numbers
            expect(typeof result.page).toBe("number");
            expect(typeof result.limit).toBe("number");
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Data Integrity Properties", () => {
    it("should preserve non-date data when formatting timestamps", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer(),
            name: fc.string(),
            count: fc.integer(),
            active: fc.boolean(),
            createdAt: fc.date(),
          }),
          (obj) => {
            const result = formatTimestampsInObject(obj);
            
            // Non-date fields should be unchanged
            expect(result.id).toBe(obj.id);
            expect(result.name).toBe(obj.name);
            expect(result.count).toBe(obj.count);
            expect(result.active).toBe(obj.active);
            
            // Date field should be formatted
            expect(typeof result.createdAt).toBe("string");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle deeply nested structures", () => {
      fc.assert(
        fc.property(
          fc.record({
            level1: fc.record({
              level2: fc.record({
                level3: fc.record({
                  timestamp: fc.date(),
                  value: fc.integer(),
                }),
              }),
            }),
          }),
          (obj) => {
            const result = formatTimestampsInObject(obj);
            
            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            expect(result.level1.level2.level3.timestamp).toMatch(iso8601Regex);
            expect(result.level1.level2.level3.value).toBe(obj.level1.level2.level3.value);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle mixed arrays with dates and primitives", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.record({ date: fc.date() }),
              fc.record({ value: fc.integer() })
            ),
            { maxLength: 20 }
          ),
          (arr) => {
            const result = formatTimestampsInObject(arr);
            
            expect(result.length).toBe(arr.length);
            
            result.forEach((item, index) => {
              if ('date' in item) {
                const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
                expect(item.date).toMatch(iso8601Regex);
              } else {
                expect(item.value).toBe((arr[index] as any).value);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
