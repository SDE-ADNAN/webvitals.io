/**
 * Property-based tests for input validation middleware
 * Feature: backend-api, Property 4: Input Validation
 * Validates: Requirements 18.1
 */

import * as fc from "fast-check";
import { z, ZodError } from "zod";
import { Request, Response } from "express";
import { validate, formatValidationErrors } from "./validate";

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

// Custom email generator that produces valid RFC 5322 emails that Zod accepts
const validEmailArb = fc.tuple(
  fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/),  // local part: starts with letter
  fc.stringMatching(/^[a-z][a-z0-9]{0,5}$/),  // domain name
  fc.constantFrom("com", "org", "net", "io")   // TLD
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

// Custom invalid email generator
const invalidEmailArb = fc.oneof(
  fc.constant("notanemail"),
  fc.constant("missing@tld"),
  fc.constant("@nodomain.com"),
  fc.constant("spaces in@email.com"),
  fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes("@"))
);

describe("Input Validation Property Tests", () => {
  /**
   * Property 4: Input Validation
   * For any API request with body, input should be validated against schemas
   */
  describe("Feature: backend-api, Property 4: Input Validation", () => {
    // Test schema for property tests
    const testSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).max(50),
    });

    it("should accept any valid input matching the schema", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: validEmailArb,
            password: fc.string({ minLength: 8, maxLength: 100 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (validInput) => {
            const req = createMockRequest(validInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();
            let nextCalled = false;

            const middleware = validate(testSchema);
            middleware(req as Request, res as Response, () => {
              nextCalled = true;
            });

            // Property: Valid input should call next() and not return error
            expect(nextCalled).toBe(true);
            expect(getStatusCode()).toBeNull();
            expect(getJsonData()).toBeNull();

            // Property: Request body should contain validated data
            expect(req.body).toEqual(validInput);
          }
        ),
        { numRuns: 50 } // Reduced for faster execution
      );
    });

    it("should reject any input with invalid email format", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: invalidEmailArb,
            password: fc.string({ minLength: 8, maxLength: 100 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (invalidInput) => {
            const req = createMockRequest(invalidInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();
            let nextCalled = false;

            const middleware = validate(testSchema);
            middleware(req as Request, res as Response, () => {
              nextCalled = true;
            });

            // Property: Invalid email should return 400 and not call next()
            expect(nextCalled).toBe(false);
            expect(getStatusCode()).toBe(400);
            expect(getJsonData().error).toBe("Validation Error");
          }
        ),
        { numRuns: 50 } // Reduced for faster execution
      );
    });

    it("should reject any input with password shorter than minimum length", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: validEmailArb,
            password: fc.string({ minLength: 1, maxLength: 7 }), // Always less than 8
            name: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (invalidInput) => {
            const req = createMockRequest(invalidInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();
            let nextCalled = false;

            const middleware = validate(testSchema);
            middleware(req as Request, res as Response, () => {
              nextCalled = true;
            });

            // Property: Short password should return 400
            expect(nextCalled).toBe(false);
            expect(getStatusCode()).toBe(400);
            expect(getJsonData().error).toBe("Validation Error");
          }
        ),
        { numRuns: 50 } // Reduced for faster execution
      );
    });

    it("should reject any input missing required fields", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Missing email
            fc.record({
              password: fc.string({ minLength: 8, maxLength: 100 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            // Missing password
            fc.record({
              email: validEmailArb,
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            // Missing name
            fc.record({
              email: validEmailArb,
              password: fc.string({ minLength: 8, maxLength: 100 }),
            }),
            // Empty object
            fc.constant({})
          ),
          async (incompleteInput) => {
            const req = createMockRequest(incompleteInput);
            const { res, getStatusCode, getJsonData } = createMockResponse();
            let nextCalled = false;

            const middleware = validate(testSchema);
            middleware(req as Request, res as Response, () => {
              nextCalled = true;
            });

            // Property: Missing required fields should return 400
            expect(nextCalled).toBe(false);
            expect(getStatusCode()).toBe(400);
            expect(getJsonData().error).toBe("Validation Error");
          }
        ),
        { numRuns: 50 } // Reduced for faster execution
      );
    });
  });

  describe("formatValidationErrors", () => {
    it("should format any Zod error with field details", async () => {
      // Use strict schema that won't coerce types
      const schema = z.object({
        field1: z.string().min(1),
        field2: z.number().positive(),
      }).strict();

      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Always generate invalid types to ensure validation fails
            field1: fc.boolean(), // Should be string - boolean won't coerce
            field2: fc.boolean(), // Should be number - boolean won't coerce
          }),
          async (invalidInput) => {
            // Use parse which throws ZodError on failure
            let zodError: ZodError | null = null;
            try {
              schema.parse(invalidInput);
            } catch (e) {
              if (e instanceof ZodError) {
                zodError = e;
              }
            }

            // This should always fail since we're passing wrong types
            expect(zodError).not.toBeNull();
            
            if (zodError) {
              const formatted = formatValidationErrors(zodError);

              // Property: Formatted error should have correct structure
              expect(formatted.error).toBe("Validation Error");
              expect(formatted.message).toBe("Request validation failed");
              expect(Array.isArray(formatted.details)).toBe(true);
              expect(formatted.details.length).toBeGreaterThan(0);

              // Property: Each detail should have field and message
              formatted.details.forEach((detail) => {
                expect(typeof detail.field).toBe("string");
                expect(typeof detail.message).toBe("string");
              });
            }
          }
        ),
        { numRuns: 50 } // Reduced for faster execution
      );
    });
  });
});
