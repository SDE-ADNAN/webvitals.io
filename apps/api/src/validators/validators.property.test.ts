/**
 * Property-based tests for validation error field details
 * Feature: backend-api, Property 23: Validation Error Field Details
 * Validates: Requirements 18.3
 */

import * as fc from "fast-check";
import { z, ZodError } from "zod";
import { Request, Response } from "express";
import { validate, formatValidationErrors } from "../middleware/validate";
import { registerSchema, loginSchema } from "./authValidators";
import { createSiteSchema } from "./siteValidators";
import { metricSchema } from "./metricValidators";
import { createAlertSchema } from "./alertValidators";

// Mock Express request/response
function createMockRequest(body: any): Partial<Request> {
  return { body };
}

function createMockResponse(): {
  res: Partial<Response>;
  getStatusCode: () => number | null;
  getJsonData: () => any;
} {
  let statusCode: number | null = null;
  let jsonData: any = null;

  const res: Partial<Response> = {
    status(code: number) {
      statusCode = code;
      return this as Response;
    },
    json(data: any) {
      jsonData = data;
      return this as Response;
    },
  };

  return {
    res,
    getStatusCode: () => statusCode,
    getJsonData: () => jsonData,
  };
}

describe("Validation Error Field Details Property Tests", () => {
  /**
   * Property 23: Validation Error Field Details
   * For any validation error, response should include specific invalid fields
   */
  describe("Feature: backend-api, Property 23: Validation Error Field Details", () => {
    it("should include field names in validation errors for register schema", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Generate invalid data - wrong types
            email: fc.boolean(),
            password: fc.boolean(),
            firstName: fc.boolean(),
            lastName: fc.boolean(),
          }),
          async (invalidInput) => {
            const req = createMockRequest(invalidInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();

            const middleware = validate(registerSchema);
            middleware(req as Request, res as Response, () => {});

            // Property: Validation error should include field details
            expect(getStatusCode()).toBe(400);
            const response = getJsonData();
            expect(response.error).toBe("Validation Error");
            expect(Array.isArray(response.details)).toBe(true);
            expect(response.details.length).toBeGreaterThan(0);

            // Property: Each detail should specify which field is invalid
            response.details.forEach((detail: { field: string; message: string }) => {
              expect(typeof detail.field).toBe("string");
              expect(typeof detail.message).toBe("string");
            });

            // Property: Field names should match schema fields
            const fieldNames = response.details.map((d: { field: string }) => d.field);
            const validFields = ["email", "password", "firstName", "lastName"];
            fieldNames.forEach((field: string) => {
              expect(validFields).toContain(field);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should include field names in validation errors for site schema", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Generate invalid data
            name: fc.boolean(), // Should be string 3-50 chars
            url: fc.boolean(),  // Should be valid URL
          }),
          async (invalidInput) => {
            const req = createMockRequest(invalidInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();

            const middleware = validate(createSiteSchema);
            middleware(req as Request, res as Response, () => {});

            // Property: Validation error should include field details
            expect(getStatusCode()).toBe(400);
            const response = getJsonData();
            expect(response.error).toBe("Validation Error");
            expect(Array.isArray(response.details)).toBe(true);
            expect(response.details.length).toBeGreaterThan(0);

            // Property: Field names should match schema fields
            const fieldNames = response.details.map((d: { field: string }) => d.field);
            const validFields = ["name", "url"];
            fieldNames.forEach((field: string) => {
              expect(validFields).toContain(field);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should include field names in validation errors for metric schema", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Generate invalid data - wrong types for numeric fields
            lcp: fc.boolean(),
            fid: fc.boolean(),
            cls: fc.boolean(),
            deviceType: fc.boolean(),
            browserName: fc.boolean(),
          }),
          async (invalidInput) => {
            const req = createMockRequest(invalidInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();

            const middleware = validate(metricSchema);
            middleware(req as Request, res as Response, () => {});

            // Property: Validation error should include field details
            expect(getStatusCode()).toBe(400);
            const response = getJsonData();
            expect(response.error).toBe("Validation Error");
            expect(Array.isArray(response.details)).toBe(true);
            expect(response.details.length).toBeGreaterThan(0);

            // Property: Field names should match schema fields
            const fieldNames = response.details.map((d: { field: string }) => d.field);
            const validFields = ["lcp", "fid", "cls", "deviceType", "browserName", "ttfb", "fcp", "tti", "osName", "pageUrl"];
            fieldNames.forEach((field: string) => {
              expect(validFields).toContain(field);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should include field names in validation errors for alert schema", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Generate invalid data
            siteId: fc.boolean(),
            metricType: fc.boolean(),
            threshold: fc.boolean(),
            condition: fc.boolean(),
          }),
          async (invalidInput) => {
            const req = createMockRequest(invalidInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();

            const middleware = validate(createAlertSchema);
            middleware(req as Request, res as Response, () => {});

            // Property: Validation error should include field details
            expect(getStatusCode()).toBe(400);
            const response = getJsonData();
            expect(response.error).toBe("Validation Error");
            expect(Array.isArray(response.details)).toBe(true);
            expect(response.details.length).toBeGreaterThan(0);

            // Property: Field names should match schema fields
            const fieldNames = response.details.map((d: { field: string }) => d.field);
            const validFields = ["siteId", "metricType", "threshold", "condition"];
            fieldNames.forEach((field: string) => {
              expect(validFields).toContain(field);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should return specific error messages for each invalid field", async () => {
      // Test with specific invalid inputs to verify error messages are meaningful
      const invalidInputs = [
        { email: "not-an-email", password: "short", firstName: "", lastName: "" },
        { email: "", password: "", firstName: "", lastName: "" },
      ];

      for (const invalidInput of invalidInputs) {
        const req = createMockRequest(invalidInput);
        const { res, getStatusCode, getJsonData } = createMockResponse();

        const middleware = validate(registerSchema);
        middleware(req as Request, res as Response, () => {});

        expect(getStatusCode()).toBe(400);
        const response = getJsonData();
        
        // Property: Each error detail should have a non-empty message
        response.details.forEach((detail: { field: string; message: string }) => {
          expect(detail.message.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
